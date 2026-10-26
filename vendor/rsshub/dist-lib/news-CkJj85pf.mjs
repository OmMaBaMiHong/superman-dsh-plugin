import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as renderHTML } from "./utils-DwzIry3A.mjs";
//#region lib/routes/gocn/news.ts
const route = {
	path: ["/", "/news"],
	name: "Unknown",
	maintainers: ["AtlanCI", "CcccFz"],
	handler,
	url: "gocn.vip/"
};
async function handler() {
	const base_url = "https://gocn.vip/c/3lQ6GbD5ny/home";
	const article_url = "https://gocn.vip/c/3lQ6GbD5ny";
	return {
		title: "GoCN社区-最新动态",
		link: base_url,
		description: "获取GoCN站点最新动态",
		item: (await got_default({
			url: "https://gocn.vip/api/home/page",
			headers: { Referer: base_url }
		})).data.data.articlePageList.list.map((item) => ({
			title: item.name,
			link: `${article_url}/s/${item.spaceGuid}/d/${item.guid}`,
			description: renderHTML(JSON.parse(item.content)),
			pubDate: parseDate(item.ctime, "X"),
			author: item.nickname
		}))
	};
}
//#endregion
export { route };
