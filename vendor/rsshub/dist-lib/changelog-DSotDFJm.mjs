import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/oo-software/changelog.ts
const route = {
	path: "/changelog/:id",
	categories: ["program-update"],
	example: "/oo-software/changelog/shutup10",
	parameters: { id: "Software id, see below, shutup10 by default, can be found in URL" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Changelog",
	maintainers: ["nczitzk"],
	handler,
	description: `| Software        | Id          |
| --------------- | ----------- |
| O\\&O ShutUp10++ | shutup10    |
| O\\&O AppBuster  | ooappbuster |
| O\\&O Lanytix    | oolanytix   |
| O\\&O DeskInfo   | oodeskinfo  |`
};
async function handler(ctx) {
	const currentUrl = `https://www.oo-software.com/en/${ctx.req.param("id") ?? "shutup10"}/changelog`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	const items = $(".content h4").toArray().map((item) => {
		item = $(item);
		const title = item.text();
		return {
			title,
			link: `${currentUrl}#${title.split(" – ", 1)[0]}`,
			description: item.next().html(),
			pubDate: parseDate(title.match(/released (on )?(.*)$/)[2], "MMMM DD, YYYY")
		};
	});
	items[0].enclosure_url = $(".banner-inlay").find("a").attr("href");
	return {
		title: $("title").text(),
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
