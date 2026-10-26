import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/putty/changes.ts
const route = {
	path: "/changes",
	categories: ["program-update"],
	example: "/putty/changes",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.chiark.greenend.org.uk/~sgtatham/putty/changes.html", "www.chiark.greenend.org.uk/"] }],
	name: "Change Log",
	maintainers: ["nczitzk"],
	handler,
	url: "www.chiark.greenend.org.uk/~sgtatham/putty/changes.html"
};
async function handler() {
	const rootUrl = "https://www.chiark.greenend.org.uk";
	const currentUrl = `${rootUrl}/~sgtatham/putty/changes.html`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data.replaceAll("href=\"releases", "class=\"version\" href=\"releases"));
	const items = $(".version").toArray().map((item) => {
		item = $(item);
		const title = item.parent().text().split("in").pop();
		return {
			title,
			link: `${rootUrl}/~sgtatham/putty/${item.attr("href")}`,
			description: item.parent().next().html(),
			pubDate: parseDate(title.match(/\(released (.*)\)/)[1])
		};
	});
	return {
		title: $("title").text(),
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
