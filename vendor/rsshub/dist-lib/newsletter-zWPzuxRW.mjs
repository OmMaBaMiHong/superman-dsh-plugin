import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
//#region lib/routes/bestblogs/newsletter.ts
const route = {
	path: "/newsletter",
	categories: ["programming"],
	example: "/bestblogs/newsletter",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "精选推送",
	maintainers: ["occam-7"],
	handler
};
async function handler(ctx) {
	return {
		title: "Bestblogs.dev - 精选推送",
		link: "https://www.bestblogs.dev/newsletter",
		item: ((await rofetch("https://www.bestblogs.dev/api/proxy/newsletters", {
			method: "GET",
			query: {
				page: 1,
				pageSize: Number(ctx.req.query("limit") ?? "10"),
				language: "zh"
			}
		})).data?.dataList ?? []).map((item) => ({
			title: item.title,
			link: `https://www.bestblogs.dev/newsletter/${item.id}`,
			description: item.summary,
			pubDate: parseDate(item.createdTimestamp)
		}))
	};
}
//#endregion
export { route };
