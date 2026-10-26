import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { load } from "cheerio";
//#region lib/routes/finviz/news.ts
const categories = {
	news: 0,
	blogs: 1
};
const route = {
	path: "/:category?",
	categories: ["finance"],
	view: 0,
	example: "/finviz",
	parameters: { category: {
		description: "Category, see below, News by default",
		options: Object.keys(categories).map((key) => ({
			value: key,
			label: key
		}))
	} },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["finviz.com/news.ashx", "finviz.com/"] }],
	name: "News",
	maintainers: ["nczitzk"],
	handler,
	url: "finviz.com/news.ashx",
	description: `| News | Blogs |
| ---- | ----- |
| news | blogs |`
};
async function handler(ctx) {
	const { category = "News" } = ctx.req.param();
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 200;
	if (!Object.hasOwn(categories, category.toLowerCase())) throw new InvalidParameterError(`No category '${category}'.`);
	const rootUrl = "https://finviz.com";
	const currentUrl = new URL("news.ashx", rootUrl).href;
	const { data: response } = await got_default(currentUrl);
	const $ = load(response);
	const items = $("table.table-fixed").eq(categories[category.toLowerCase()]).find("tr").slice(0, limit).toArray().map((item) => {
		item = $(item);
		const a = item.find("a.nn-tab-link");
		const descriptionMatches = a.parent().prop("data-boxover")?.match(/<td class='news_tooltip-tab'>(.*?)<\/td>/);
		const authorMatches = item.find("use").first().prop("href")?.match(/#(.*?)-(light|dark)/);
		return {
			title: a.text(),
			link: a.prop("href"),
			description: descriptionMatches ? descriptionMatches[1] : void 0,
			author: authorMatches ? authorMatches[1].replaceAll("-", " ") : "finviz",
			pubDate: timezone(parseDate(item.find("td.news_date-cell").text(), ["HH:mmA", "MMM-DD"]), -4)
		};
	}).filter((item) => item.title);
	const icon = $("link[rel=\"icon\"]").prop("href");
	return {
		item: items,
		title: `finviz - ${category}`,
		link: currentUrl,
		description: $("meta[name=\"description\"]").prop("content"),
		language: "en-US",
		image: new URL($("a.logo svg use").first().prop("href"), rootUrl).href,
		icon,
		logo: icon,
		subtitle: $("title").text()
	};
}
//#endregion
export { route };
