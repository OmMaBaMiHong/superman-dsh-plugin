import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as utils_default } from "./utils-CwcQVYKl2.mjs";
import { load } from "cheerio";
//#region lib/routes/penguin-random-house/articles.ts
const route = {
	path: "/articles",
	categories: ["reading"],
	example: "/penguin-random-house/articles",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["penguinrandomhouse.com/articles"] }],
	name: "Articles",
	maintainers: ["StevenRCE0"],
	handler,
	url: "penguinrandomhouse.com/articles"
};
async function handler(ctx) {
	const link = "https://www.penguinrandomhouse.com/articles/";
	const $ = load((await got_default(link)).data);
	const itemArray = $(".archive-module-half-container,.archive-module-third-container").toArray().map((element) => ({
		url: $(element).find("a").attr("href"),
		title: $(element).find(".archive-module-text").first().text()
	}));
	return {
		title: "Penguin Random House Articles",
		link,
		description: "In-depth interviews, author essays, fascinating essays. Go deeper into the books you love.",
		item: await utils_default.parseList(itemArray, ctx, utils_default.parseArticle)
	};
}
//#endregion
export { route };
