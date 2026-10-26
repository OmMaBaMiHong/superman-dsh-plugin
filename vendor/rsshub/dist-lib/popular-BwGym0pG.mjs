import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as parseArticle, t as baseUrl } from "./utils-BpkPfGbN.mjs";
//#region lib/routes/woshipm/popular.ts
const rangeMap = {
	daily: "日榜",
	weekly: "周榜",
	monthly: "月榜"
};
const route = {
	path: "/popular/:range?",
	categories: ["new-media"],
	example: "/woshipm/popular",
	parameters: { range: "时间，见下表，默认为 `daily`" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["woshipm.com/"],
		target: "/popular"
	}],
	name: "热门文章",
	maintainers: ["WenryXu"],
	handler,
	url: "woshipm.com/",
	description: `| 日榜  | 周榜   | 月榜    |
| ----- | ------ | ------- |
| daily | weekly | monthly |`
};
async function handler(ctx) {
	const { range = "daily" } = ctx.req.param();
	const { data: response } = await got_default(`${baseUrl}/api2/app/article/popular/${range}`);
	const list = response.RESULT.map((item) => {
		item = item.data;
		return {
			title: item.articleTitle,
			description: item.articleSummary,
			link: `${baseUrl}/${item.type || "ai"}/${item.id}.html`,
			pubDate: parseDate(item.publishTime, "x"),
			author: item.articleAuthor
		};
	});
	const result = (await Promise.allSettled(list.map((item) => parseArticle(item)))).filter((result) => result.status === "fulfilled").map((result) => result.value);
	return {
		title: `热门文章 - ${rangeMap[range]} - 人人都是产品经理`,
		link: baseUrl,
		item: result
	};
}
//#endregion
export { route };
