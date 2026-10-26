import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/china/news/highlights/news.ts
const CATEGORY_MAP = {
	domestic: "domestic",
	international: "international",
	social: "social",
	news100: "news100"
};
const route = {
	path: "/news/:category?",
	categories: ["new-media"],
	example: "/china/news",
	parameters: { category: "Category of news. See the form below for details, default is china news." },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["news.china.com/:category"] }],
	name: "News and current affairs 时事新闻",
	maintainers: ["jiaaoMario"],
	handler,
	description: `Category of news

| China News | International News | Social News | Breaking News |
| ---------- | ------------------ | ----------- | ------------- |
| domestic   | international      | social      | news100       |`
};
async function handler(ctx) {
	const websiteUrl = `https://news.china.com/${CATEGORY_MAP[ctx.req.param("category")] ?? CATEGORY_MAP.domestic}`;
	const data = (await got_default(websiteUrl)).data;
	const $ = load(data);
	const categoryTitle = $(".wp_title").text();
	const news = $(".item_list li");
	return {
		title: `中华网-${categoryTitle}新闻`,
		link: websiteUrl,
		item: news.toArray().map((item) => {
			item = $(item);
			return {
				title: item.find(".item_title a").text(),
				author: item.find(".item_source").text(),
				category: `${categoryTitle}新闻`,
				pubDate: parseDate(item.find(".item_time").text()),
				description: item.find(".item_title a").text(),
				link: item.find("li a").attr("href")
			};
		})
	};
}
//#endregion
export { route };
