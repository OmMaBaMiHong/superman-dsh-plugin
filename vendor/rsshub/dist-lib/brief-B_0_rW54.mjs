import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { r as rootUrl } from "./utils-DlON7c1Q.mjs";
//#region lib/routes/yicai/brief.ts
const route = {
	path: "/brief",
	categories: ["traditional-media"],
	example: "/yicai/brief",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["yicai.com/brief"] }],
	name: "正在",
	maintainers: ["sanmmm", "nczitzk"],
	handler,
	url: "yicai.com/brief"
};
async function handler(ctx) {
	return {
		title: "第一财经 - 正在",
		link: `${rootUrl}/brief`,
		item: (await got_default({
			method: "get",
			url: `${rootUrl}/api/ajax/getbrieflist?type=0&page=1&pagesize=${ctx.req.query("limit") ?? 50}`
		})).data.map((item) => ({
			title: item.indexTitle,
			link: `${rootUrl}${item.url}`,
			description: item.newcontent,
			pubDate: timezone(parseDate(`${item.datekey} ${item.hm}`, "YYYY.MM.DD HH:mm"), 8)
		}))
	};
}
//#endregion
export { route };
