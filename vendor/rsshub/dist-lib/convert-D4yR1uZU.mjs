import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/sse/convert.ts
const route = {
	path: "/convert/:query?",
	categories: ["finance"],
	example: "/sse/convert/beginDate=2018-08-18&endDate=2019-08-18&companyCode=603283&title=股份",
	parameters: { query: "筛选条件，见示例" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "可转换公司债券公告",
	maintainers: ["kt286"],
	handler
};
async function handler(ctx) {
	const query = ctx.req.param("query") ?? "";
	const pageUrl = "https://bond.sse.com.cn/disclosure/announ/convertible/";
	const host = "https://www.sse.com.cn";
	const queries = {};
	if (query) {
		const pairs = query.split("&");
		for (const pair of pairs) {
			const [key, value] = pair.split("=");
			if (key) queries[key] = value;
		}
	}
	return {
		title: "上证债券信息网 - 可转换公司债券公告",
		link: pageUrl,
		item: (await got_default("https://query.sse.com.cn/infodisplay/queryBulletinKzzTipsNew.do", {
			searchParams: {
				isPagination: true,
				"pageHelp.pageSize": 20,
				flag: 0,
				_: Date.now(),
				...queries
			},
			headers: { Referer: pageUrl }
		})).data.result.map((item) => ({
			title: item.title,
			description: `${host}${item.URL}`,
			pubDate: parseDate(item.ADDDATE),
			link: `${host}${item.URL}`,
			author: item.security_Code
		}))
	};
}
//#endregion
export { route };
