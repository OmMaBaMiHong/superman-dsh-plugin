import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/vom/featured.ts
const baseUrl = "http://www.vom.mn";
const route = {
	path: "/featured/:lang?",
	categories: ["traditional-media"],
	example: "/vom/featured",
	parameters: { lang: "Language, see the table below, `mn` by default" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["vom.mn/:lang", "vom.mn/"],
		target: "/featured/:lang"
	}],
	name: "News",
	maintainers: ["TonyRL"],
	handler,
	description: `| English | 日本語 | Монгол | Русский | 简体中文 |
| ------- | ------ | ------ | ------- | -------- |
| en      | ja     | mn     | ru      | zh       |`
};
async function handler(ctx) {
	const { lang = "mn" } = ctx.req.param();
	const { data: response } = await got_default(`${baseUrl}/${lang}`);
	const $ = load(response);
	const items = [...new Set($("#bigNewsSlide .item, #news_3 .item").toArray().map((item) => {
		item = $(item);
		return { link: item.find("a").eq(0).attr("href") };
	}))];
	await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: response } = await got_default(item.link);
		const $ = load(response);
		item.title = $("h2").text();
		item.author = $(".uk-border-circle").next().text();
		item.pubDate = parseDate($(".vom-news-show-meta .right").prev().text());
		item.category = $(".vom-news-show-meta .uk-button-text").text();
		$(".uk-article-title, .uk-text-meta, article .uk-grid-small").remove();
		item.description = $("article").html();
		return item;
	})));
	return {
		title: $("meta[name=description]").attr("content"),
		image: "http://www.vom.mn/dist/images/vom-logo.png",
		item: items
	};
}
//#endregion
export { route };
