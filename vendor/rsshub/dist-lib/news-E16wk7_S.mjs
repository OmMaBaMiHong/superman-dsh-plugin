import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as outPlaywright } from "./playwright-DGfbX7qN.mjs";
import { load } from "cheerio";
//#region lib/routes/ccac/utils.ts
const BASE_URL = "https://www.ccac.org.mo";
const LANG_TYPE = {
	en: "en-us",
	sc: "zh-cn",
	tc: "zh-hk",
	pt: "pt"
};
const TYPE = {
	all: "全部",
	case: "案件發佈",
	Persuasion: "調查報告或勸喻",
	AnnualReport: "年度報告",
	PCANews: "公署消息"
};
function langBase(lang) {
	return `${BASE_URL}/${lang}/news.html`;
}
function typeFilter(list, type) {
	return type === "全部" ? list : list.filter((item) => item.tags.some((tag) => tag.name === type));
}
var utils_default = {
	TYPE,
	BASE_URL,
	LANG_TYPE,
	langBase,
	typeFilter
};
//#endregion
//#region lib/routes/ccac/news.ts
const route = {
	path: "/news/:type/:lang?",
	categories: ["government"],
	example: "/ccac/news/all",
	parameters: {
		type: "Category",
		lang: "Language, default to `sc`. Supprot `en`(English), `sc`(Simplified Chinese), `tc`(Traditional Chinese) and `pt`(Portuguese)"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: true,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Latest News",
	maintainers: ["linbuxiao"],
	handler,
	description: `Category

| All | Detected Cases | Investigation Reports or Recommendations | Annual Reports | CCAC's Updates |
| --- | -------------- | ---------------------------------------- | -------------- | -------------- |
| all | case           | Persuasion                               | AnnualReport   | PCANews        |`
};
async function handler(ctx) {
	const context = await outPlaywright();
	const lang = ctx.req.param("lang") ?? "sc";
	const type = utils_default.TYPE[ctx.req.param("type")];
	const BASE = utils_default.langBase(lang);
	const page = await context.newPage();
	await page.route("**/*", (route) => {
		const request = route.request();
		request.resourceType() === "document" || request.resourceType() === "script" ? route.continue() : route.abort();
	});
	await page.goto(BASE, { waitUntil: "domcontentloaded" });
	const articles = await page.evaluate(() => window.articles);
	await context.close();
	const list = utils_default.typeFilter(articles, type).slice(0, ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 30).map((item) => ({
		title: item.name,
		category: item.tags.map((tag) => tag.name),
		link: utils_default.BASE_URL + item.url,
		pubDate: parseDate(item.time, "YYYY-MM-DD")
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const $ = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		$(".article_details_body > *").removeAttr("style");
		item.description = $(".article_details_body").html();
		return item;
	})));
	return {
		title: `CCAC ${type}`,
		link: BASE,
		description: `CCAC ${type}`,
		language: ctx.req.param("lang") ? utils_default.LANG_TYPE[ctx.req.param("lang")] : utils_default.LANG_TYPE.sc,
		item: items
	};
}
//#endregion
export { route };
