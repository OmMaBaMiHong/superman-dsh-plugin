import { t as got_default } from "./got-Dnzt41dd.mjs";
import { i as getArticleList, n as cookieJar, r as getArticle, t as baseUrl } from "./utils-8wIE3g81.mjs";
import { load } from "cheerio";
//#region lib/routes/nature/highlight.ts
const route = {
	path: "/highlight/:journal?",
	categories: ["journal"],
	example: "/nature/highlight",
	parameters: { journal: "short name for a journal, `nature` by default" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: true
	},
	radar: [{
		source: [
			"nature.com/:journal/articles",
			"nature.com/:journal",
			"nature.com/"
		],
		target: "/highlight/:journal"
	}],
	name: "Research Highlight",
	maintainers: [],
	handler,
	description: `::: warning
Only some journals are supported.
:::`
};
async function handler(ctx) {
	const { journal = "nature" } = ctx.req.param();
	const url = `${baseUrl}/${journal}/articles?type=research-highlight`;
	const $ = load((await got_default(url, { cookieJar })).data);
	let items = getArticleList($);
	items = await Promise.all(items.map((item) => getArticle(item)));
	return {
		title: $("title").text().trim(),
		description: $("meta[name=description]").attr("content"),
		link: url,
		item: items
	};
}
//#endregion
export { route };
