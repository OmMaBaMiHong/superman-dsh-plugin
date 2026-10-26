import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { t as getContent } from "./utils-BkVbBR3v.mjs";
import { load } from "cheerio";
//#region lib/routes/njust/cwc.ts
const map = /* @__PURE__ */ new Map([["tzgg", {
	title: "南京理工大学财务处 -- 通知公告",
	id: "/12432"
}], ["bslc", {
	title: "南京理工大学财务处 -- 办事流程",
	id: "/1382"
}]]);
const host = "https://cwc.njust.edu.cn";
const route = {
	path: "/cwc/:type?",
	categories: ["university"],
	example: "/njust/cwc/tzgg",
	parameters: { type: "分类名，见下表，默认为通知公告" },
	features: {
		requireConfig: false,
		requirePuppeteer: true,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "财务处",
	maintainers: ["MilkShakeYoung", "jasongzy"],
	handler,
	description: `| 通知公告 | 办事流程 |
| -------- | -------- |
| tzgg     | bslc     |`
};
async function handler(ctx) {
	const type = ctx.req.param("type") ?? "tzgg";
	const info = map.get(type);
	if (!info) throw new InvalidParameterError("invalid type");
	const id = info.id;
	const siteUrl = host + id + "/list.htm";
	const $ = load(await getContent(siteUrl, true));
	const list = $("ul.news_list").find("li");
	return {
		title: info.title,
		link: siteUrl,
		item: list.toArray().map((item) => ({
			title: $(item).find("a").attr("title").trim(),
			pubDate: timezone(parseDate($(item).find("span.news_meta").text(), "YYYY-MM-DD"), 8),
			link: $(item).find("a").attr("href")
		}))
	};
}
//#endregion
export { route };
