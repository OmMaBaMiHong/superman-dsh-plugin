import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/sourceforge/index.ts
const route = {
	path: "/:routeParams?",
	categories: ["program-update"],
	example: "/sourceforge/topic=artificial-intelligence&os=windows",
	parameters: { routeParams: "route params, see below" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Software",
	maintainers: ["JimenezLi"],
	handler,
	description: `For some URL like <https://sourceforge.net/directory/artificial-intelligence/windows/>, it is equal to [https://sourceforge.net/directory/?topic=artificial-intelligence\\&os=windows"](https://sourceforge.net/directory/?topic=artificial-intelligence\\&os=windows), thus subscribing to \`/sourceforge/topic=artificial-intelligence&os=windows\`.

URL params can duplicate, such as \`/sourceforge/topic=artificial-intelligence&os=windows&os=linux\`.`
};
async function handler(ctx) {
	const routeParams = ctx.req.param("routeParams");
	const baseURL = "https://sourceforge.net";
	const link = `https://sourceforge.net/directory/?${routeParams.toString()}`;
	const $ = load((await got_default.get(link)).data);
	const itemList = $("ul.projects li[itemprop=itemListElement]");
	return {
		title: $(".content h1").text().trim(),
		link,
		item: itemList.toArray().map((element) => {
			const item = $(element);
			return {
				title: item.find(".result-heading-title").text().trim(),
				link: `${baseURL}${item.find(".result-heading-title").attr("href")}`,
				description: item.find(".result-heading-texts").html(),
				pubDate: parseDate(item.find("time").attr("datetime"), "YYYY-MM-DD")
			};
		})
	};
}
//#endregion
export { route };
