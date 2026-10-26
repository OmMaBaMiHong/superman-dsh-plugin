import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as renderHTML } from "./utils-DwzIry3A.mjs";
//#region lib/routes/gocn/topics.ts
const route = {
	path: "/topics",
	categories: ["programming"],
	example: "/gocn/topics",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["gocn.vip/"] }],
	name: "每日新闻",
	maintainers: ["AtlanCI", "CcccFz"],
	handler,
	url: "gocn.vip/"
};
async function handler() {
	const base_url = "https://gocn.vip/c/3lQ6GbD5ny/home";
	const article_url = "https://gocn.vip/c/3lQ6GbD5ny";
	return {
		title: "GoCN社区-每日新闻",
		link: base_url,
		description: "获取GoCN站点每日新闻",
		item: (await got_default({
			url: "https://gocn.vip/api/files?spaceGuid=Gd7BTB&currentPage=1&sort=1",
			headers: { Referer: base_url }
		})).data.data.list.map((item) => ({
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
