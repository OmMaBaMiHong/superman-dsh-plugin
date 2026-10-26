import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as utils_default } from "./utils-CwcQVYKl2.mjs";
import { load } from "cheerio";
//#region lib/routes/penguin-random-house/thereaddown.ts
const route = {
	path: "/the-read-down",
	categories: ["reading"],
	example: "/penguin-random-house/the-read-down",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["penguinrandomhouse.com/the-read-down"] }],
	name: "Book Lists",
	maintainers: ["StevenRCE0"],
	handler,
	url: "penguinrandomhouse.com/the-read-down"
};
async function handler(ctx) {
	const link = "https://www.penguinrandomhouse.com/the-read-down/";
	const $ = load((await got_default(link)).data);
	const itemArray = $(".archive-module-half-container,.archive-module-third-container").toArray().map((element) => ({
		url: $(element).find("a").attr("href"),
		title: $(element).find(".archive-module-text").first().text()
	}));
	return {
		title: "Penguin Random House Book Lists",
		link,
		description: "Never wonder what to read next! Check out these lists to find your next favorite book.",
		item: await utils_default.parseList(itemArray, ctx, utils_default.parseBooks)
	};
}
//#endregion
export { route };
