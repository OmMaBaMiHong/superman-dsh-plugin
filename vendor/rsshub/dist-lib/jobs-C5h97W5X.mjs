import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as renderHTML } from "./utils-DwzIry3A.mjs";
//#region lib/routes/gocn/jobs.ts
const route = {
	path: "/jobs",
	categories: ["programming"],
	example: "/gocn/jobs",
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
	name: "招聘",
	maintainers: ["AtlanCI", "CcccFz"],
	handler,
	url: "gocn.vip/"
};
async function handler() {
	const api_url = "https://gocn.vip/api/files?spaceGuid=Gd7OHl&currentPage=1&sort=1";
	const base_url = "https://gocn.vip/c/3lQ6GbD5ny/s/Gd7OHl";
	const job_url = "https://gocn.vip/c/3lQ6GbD5ny";
	return {
		title: "GoCN社区-招聘",
		link: base_url,
		description: "获取GoCN站点招聘",
		item: (await got_default({ url: api_url })).data.data.list.map((item) => ({
			title: item.name,
			link: `${job_url}/s/${item.spaceGuid}/d/${item.guid}`,
			description: renderHTML(JSON.parse(item.content)),
			pubDate: parseDate(item.ctime, "X"),
			author: item.nickname
		}))
	};
}
//#endregion
export { route };
