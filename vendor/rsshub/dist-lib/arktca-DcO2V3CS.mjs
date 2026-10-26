import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/hypergryph/arknights/arktca.ts
const rssDescription = "明日方舟期刊《回归线》 | 泰拉创作者联合会";
const url = "aneot.arktca.com";
const author = "Bendancom";
const route = {
	path: "/arknights/arktca",
	categories: ["game"],
	example: "/hypergryph/arknights/arktca",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "回归线",
	url,
	maintainers: [author],
	radar: [{ source: [url] }],
	description: rssDescription,
	handler
};
async function handler() {
	const baseUrl = `https://${url}`;
	const { data: allResponse } = await got_default(`${baseUrl}/posts/`);
	const $ = load(allResponse);
	const allUrlList = $("div.theme-hope-content > table").find("a").toArray().map((item) => baseUrl + $(item).prop("href"));
	const journalList = await Promise.all(allUrlList.map(async (item) => {
		const { data: response } = await got_default(item);
		const $$ = load(response);
		const match = /(?<=Vol. )\w+/.exec($$("div.vp-page-title").find("h1").text());
		return {
			volume: match ? match[0] : "",
			links: $$("div.theme-hope-content > ul a").toArray().map((e) => baseUrl + $(e).prop("href"))
		};
	}));
	const journals = await Promise.all(journalList.map(async (item) => await Promise.all(item.links.map((link) => cache_default.tryGet(link, async () => {
		const { data: response } = await got_default(link);
		const $$ = load(response);
		$$("div.ads-container").remove();
		const language = $$("html").prop("lang");
		const pageTitle = $$("div.vp-page-title");
		const title = `Vol.${item.volume} ` + pageTitle.children("h1").text();
		const pageInfo = pageTitle.children("div.page-info");
		return {
			title,
			language,
			author: pageInfo.children("span.page-author-info").find("span.page-author-item").text(),
			pubDate: parseDate(pageInfo.children("span.page-date-info").children("meta").prop("content")),
			category: pageInfo.find("span.page-category-info").children("meta").prop("content"),
			description: $$("div.theme-hope-content").html(),
			comments: Number.parseInt($$("span.wl-num").text()),
			guid: link,
			link
		};
	})))));
	const logoUrl = `${baseUrl}/logo.svg`;
	return {
		title: "回归线",
		link: baseUrl,
		description: rssDescription,
		icon: logoUrl,
		logo: logoUrl,
		image: logoUrl,
		author,
		language: "zh-CN",
		item: journals.flat(Infinity)
	};
}
//#endregion
export { route };
