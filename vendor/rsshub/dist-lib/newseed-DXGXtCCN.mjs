import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/newseed/index.ts
const route = {
	path: "/latest",
	categories: ["new-media"],
	example: "/newseed/latest",
	url: "news.newseed.cn",
	name: "最新新闻",
	maintainers: ["p3psi-boo"],
	handler
};
async function handler() {
	const baseUrl = "https://news.newseed.cn/";
	const $ = load((await got_default({
		method: "get",
		url: baseUrl
	})).data);
	const list = $("#news-list li").toArray().map((item) => {
		const element = $(item);
		const a = element.find("h3 a");
		const link = a.attr("href") || "";
		const title = a.text();
		const image = element.find(".img img").attr("src");
		const info = element.find(".info");
		const author = info.find(".author a").text();
		return {
			title,
			link,
			author,
			pubDate: info.find(".date").text(),
			category: element.find(".tag a").toArray().map((el) => $(el).text()).filter((tag) => tag !== author),
			description: image ? `<img src="${image}"><br>${title}` : title
		};
	});
	return {
		title: "新芽 - 最新新闻",
		link: baseUrl,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			item.description = load((await got_default({
				method: "get",
				url: item.link
			})).data)(".news-content").html() || item.description;
			return item;
		})))
	};
}
//#endregion
export { route };
