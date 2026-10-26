import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/baijing/index.ts
const route = {
	path: "/article",
	categories: ["new-media"],
	example: "/baijing/article",
	url: "www.baijing.cn/article/",
	name: "资讯",
	maintainers: ["p3psi-boo"],
	handler
};
async function handler() {
	const list = (await rofetch("https://www.baijing.cn/index/ajax/get_article/")).data.article_list.map((item) => ({
		title: item.title,
		link: `https://www.baijing.cn/article/${item.id}`,
		author: item.user_info.user_name,
		category: item.topic?.map((t) => t.title)
	}));
	return {
		title: "白鲸出海 - 资讯",
		link: "https://www.baijing.cn/article/",
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const $ = load(await rofetch(item.link));
			item.description = $(".content").html();
			item.pubDate = parseDate($(".timeago").text());
			return item;
		})))
	};
}
//#endregion
export { route };
