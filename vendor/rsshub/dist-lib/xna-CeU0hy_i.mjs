import "./types-DNj6Etbg.mjs";
import { n as parseRelativeDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/v2ex/xna.ts
const route = {
	path: "/xna",
	categories: ["bbs", "blog"],
	view: 0,
	example: "/v2ex/xna",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "XNA",
	maintainers: ["luckyscript"],
	handler
};
async function handler(ctx) {
	const pageUrl = `https://v2ex.com/xna`;
	const $ = load((await got_default({
		method: "get",
		url: pageUrl
	})).data);
	return {
		title: "V2EX-xna",
		link: pageUrl,
		description: "V2EX-xna",
		item: $("div.xna-entry-main-container").toArray().slice(0, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 50).map((dom) => {
			const link = $(dom).find(".xna-entry-title > a");
			const author = $(dom).find(".xna-source-author > a").text();
			const dateText = $(dom).find(".xna-entry-date").text().trim();
			return {
				title: $(link).text(),
				link: $(link).attr("href"),
				description: $(link).text(),
				author,
				pubDate: dateText ? parseRelativeDate(dateText) : void 0
			};
		})
	};
}
//#endregion
export { route };
