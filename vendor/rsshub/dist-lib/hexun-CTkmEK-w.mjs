import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/hexun/index.ts
const decoder = new TextDecoder("gbk");
const route = {
	path: "/pe/news",
	categories: ["finance"],
	example: "/hexun/pe/news",
	url: "pe.hexun.com/news/",
	name: "创投行业新闻",
	maintainers: ["p3psi-boo"],
	handler
};
async function handler() {
	const baseUrl = "https://pe.hexun.com/news/";
	const response = await got_default({
		method: "get",
		url: baseUrl,
		responseType: "arrayBuffer"
	});
	const $ = load(decoder.decode(response.data));
	const list = $(".listNews li").toArray().map((item) => {
		const element = $(item);
		const a = element.find("a");
		const link = a.attr("href")?.replace("http://", "https://") || "";
		const title = a.text() || "";
		const timeSpan = element.find("span");
		return {
			title,
			link,
			pubDate: parseDate(timeSpan.text().slice(1, timeSpan.text().length - 1), "MM/DD HH:mm")
		};
	});
	return {
		title: "和讯创投 - 创投行业新闻",
		link: baseUrl,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const response = await got_default({
				method: "get",
				url: item.link,
				responseType: "arrayBuffer"
			});
			item.description = load(decoder.decode(response.data))(".art_contextBox").html() || "";
			return item;
		})))
	};
}
//#endregion
export { route };
