import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/sustech/yjs.ts
const route = {
	path: "/yjs",
	categories: ["university"],
	example: "/sustech/yjs",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["gs.sustech.edu.cn/"] }],
	name: "研究生网通知公告",
	maintainers: ["shengmaosu"],
	handler,
	url: "gs.sustech.edu.cn/"
};
async function handler() {
	const baseUrl = "https://gs.sustech.edu.cn";
	return {
		title: "南方科技大学研究生院",
		link: `${baseUrl}/#/common/index?current_id=99&id=99`,
		description: "南方科技大学研招网通知公告",
		item: (await got_default(`${baseUrl}/api/www/v1/article/list`, { searchParams: {
			page: 1,
			pageSize: 20,
			kw: "",
			sort_id: 99,
			cas_sort_id: 99
		} })).data.data.items.map((item) => ({
			title: item.title,
			link: `${baseUrl}/#/common/detail?current_id=99&id=99&article_id=${item.id}`,
			pubDate: parseDate(item.published_at, "YYYY-MM-DD")
		}))
	};
}
//#endregion
export { route };
