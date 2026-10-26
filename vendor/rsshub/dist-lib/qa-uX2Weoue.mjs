import { n as parseRelativeDate, t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/quicker/qa.ts
const route = {
	path: "/qa/:category?/:state?",
	categories: ["programming"],
	example: "/quicker/qa",
	parameters: {
		category: "分类，见下表，默认为全部",
		state: "状态，见下表，默认为全部"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "讨论区",
	maintainers: ["Cesaryuan", "nczitzk"],
	handler,
	description: `分类

| 使用问题 | 动作开发 | BUG 反馈 | 功能建议 |
| -------- | -------- | -------- | -------- |
| 1        | 9        | 3        | 4        |

| 动作需求 | 经验创意 | 动作推荐 | 信息发布 |
| -------- | -------- | -------- | -------- |
| 6        | 2        | 7        | 5        |

| 随便聊聊 | 异常报告 | 全部 |
| -------- | -------- | ---- |
| 8        | 10       | all  |

状态

| 全部 | 精华   | 已归档  |
| ---- | ------ | ------- |
|      | digest | achived |`
};
async function handler(ctx) {
	const category = ctx.req.param("category") ?? "all";
	const state = ctx.req.param("state") ?? "";
	const rootUrl = "https://getquicker.net";
	const currentUrl = `${rootUrl}/QA${category === "all" ? "" : `?category=${category}`}${state ? `?state=${state}` : ""}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	let items = $("a.question-title").slice(0, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 25).toArray().map((item) => {
		item = $(item);
		return {
			title: item.text(),
			link: `${rootUrl}${item.attr("href")}`
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		content("div[data-note=\"最后更新人信息\"]").remove();
		const pubDate = content(".info-text").first().text().replace(/创建于 /, "").trim();
		item.description = content(".topic-body").html();
		item.author = content(".user-link").first().text();
		item.pubDate = timezone(/-/.test(pubDate) ? parseDate(pubDate) : parseRelativeDate(pubDate), 8);
		return item;
	})));
	return {
		title: $("title").text(),
		link: currentUrl,
		item: items,
		allowEmpty: true
	};
}
//#endregion
export { route };
