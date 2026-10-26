import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/wabei/index.ts
const route = {
	path: "/hot-recommend",
	categories: ["finance"],
	example: "/wabei/hot-recommend",
	url: "www.wabei.cn",
	name: "热门推荐",
	maintainers: ["p3psi-boo"],
	handler
};
async function handler() {
	const baseUrl = "https://www.wabei.cn";
	const $ = load((await got_default({
		method: "get",
		url: baseUrl
	})).data);
	const list = $(".hot-news.visible-lg").toArray().map((item) => {
		const elem = $(item);
		const title = elem.find("h4 a").text().trim();
		const link = elem.find("h4 a").attr("href");
		const author = elem.find("span.author").text().trim();
		const description = elem.find("p.visible-lg a").text().trim();
		const category = [elem.find("span.lable").text().trim(), ...elem.find("span.blue-btn").toArray().map((tag) => $(tag).text().trim())];
		return {
			title,
			link: `${baseUrl}${link}`,
			category,
			author,
			description
		};
	});
	return {
		title: "挖贝网 - 热门推荐",
		link: baseUrl,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const content = load((await got_default({
				method: "get",
				url: item.link
			})).data);
			item.description = content(".subject-content").html() || item.description;
			item.pubDate = parseDate(content(".attr .time").text().trim(), "YYYY/MM/DD HH:mm:ss");
			return item;
		})))
	};
}
//#endregion
export { route };
