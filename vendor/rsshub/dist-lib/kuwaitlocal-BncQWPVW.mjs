import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/kuwaitlocal/index.ts
const route = {
	path: "/:category?",
	categories: ["new-media"],
	example: "/kuwaitlocal/article",
	parameters: { category: "Category name, can be found in URL, `latest` by default" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["kuwaitlocal.com/news/categories/:category"],
		target: "/:category"
	}],
	name: "Categorised News",
	maintainers: ["TonyRL"],
	handler,
	url: "kuwaitlocal.com/news/latest"
};
async function handler(ctx) {
	const baseUrl = "https://kuwaitlocal.com";
	const { category = "latest" } = ctx.req.param();
	const url = `${baseUrl}/news/${category === "latest" ? category : `categories/${category}`}`;
	const { data: response } = await got_default(url);
	const $ = load(response);
	const list = $("a.ggrid").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find(".txt").text().trim(),
			link: item.attr("href")
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: response } = await got_default(item.link);
		const $ = load(response);
		item.pubDate = parseDate($(".single_news_meta span").eq(0).text().trim());
		item.category = $(".tags .tag").toArray().map((item) => $(item).text().trim());
		$("[id^=div-gpt-ad]").remove();
		$(".tags_sec2, .tags_sec, .comment").remove();
		item.description = $(".single_news_img").html() + $("#news_description").html();
		return item;
	})));
	return {
		title: $("head title").text().trim(),
		description: $("head meta[name=\"description\"]").attr("content").trim(),
		link: url,
		item: items,
		language: "en"
	};
}
//#endregion
export { route };
