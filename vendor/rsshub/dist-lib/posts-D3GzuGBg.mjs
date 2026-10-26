import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
import pMap from "p-map";
//#region lib/routes/shoppingdesign/posts.ts
const route = {
	path: "/posts",
	categories: ["design"],
	example: "/shoppingdesign/posts",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.shoppingdesign.com.tw/post"] }],
	name: "文章列表",
	maintainers: ["miles170"],
	handler,
	url: "www.shoppingdesign.com.tw/post"
};
async function handler() {
	const currentUrl = "https://www.shoppingdesign.com.tw/post?sn_f=1";
	const $ = load((await got_default(currentUrl)).data);
	const items = await pMap($("article-item").toArray(), (item) => {
		item = $(item);
		const link = item.attr("url");
		return cache_default.tryGet(link, async () => {
			const $ = load((await got_default(`${link}?sn_f=1`)).data);
			const article = $(".left article .htmlview");
			article.find("d-image").each((_, el) => {
				$(el).replaceWith(`<img src="${$(el).attr("lg")}">`);
			});
			return {
				title: $(".left article .top_info h1").text(),
				author: $("meta[name=\"my:author\"]").attr("content"),
				description: article.html(),
				category: $("meta[name=\"my:category\"]").attr("content"),
				pubDate: parseDate($("meta[name=\"my:publish\"]").attr("content")),
				link
			};
		});
	}, { concurrency: 10 });
	return {
		title: $("meta[property=\"og:title\"]").attr("content"),
		link: currentUrl,
		description: $("meta[property=\"og:description\"]").attr("content"),
		item: items
	};
}
//#endregion
export { route };
