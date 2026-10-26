import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { load } from "cheerio";
//#region lib/routes/uestc/gr.ts
const baseUrl = "https://gr.uestc.edu.cn/";
const detailUrl = "https://gr.uestc.edu.cn/";
const dateTimeRegex = /(\d{4}-\d{2}-\d{2} \d{2}:\d{2})/;
const typeUrlMap = {
	important: "tongzhi/",
	teaching: "tongzhi/119",
	degree: "tongzhi/129",
	student: "tongzhi/122",
	practice: "tongzhi/123"
};
const typeNameMap = {
	important: "重要公告",
	teaching: "教学管理",
	degree: "学位管理",
	student: "学生管理",
	practice: "就业实践"
};
const route = {
	path: "/gr/:type?",
	categories: ["university"],
	example: "/uestc/gr/student",
	parameters: { type: "默认为 `important`" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["gr.uestc.edu.cn/"] }],
	name: "研究生院",
	maintainers: ["huyyi", "mobyw"],
	handler,
	url: "gr.uestc.edu.cn/",
	description: `\
| 重要公告  | 教学管理 | 学位管理 | 学生管理 | 就业实践 |
| --------- | -------- | -------- | -------- | -------- |
| important | teaching | degree   | student  | practice |`
};
async function handler(ctx) {
	const type = ctx.req.param("type") || "important";
	if (!Object.hasOwn(typeUrlMap, type)) throw new InvalidParameterError("type not supported");
	const typeName = typeNameMap[type];
	const $ = load(await rofetch(baseUrl + typeUrlMap[type]));
	const items = $("div.title").toArray().map(async (entry) => {
		const element = $(entry);
		const newsTitle = element.find("a").text() ?? "";
		const newsLink = detailUrl + element.find("a").attr("href");
		return await cache_default.tryGet(newsLink, async () => {
			const content = load(await rofetch(newsLink));
			const basicInfo = content("div.topic_detail_header").find("div.info").text();
			const match = dateTimeRegex.exec(basicInfo);
			return {
				title: newsTitle,
				link: newsLink,
				pubDate: match ? timezone(parseDate(match[1]), 8) : null,
				description: content("div.content").html()
			};
		});
	});
	const out = await Promise.all(items);
	return {
		title: `研究生院通知（${typeName}）`,
		link: baseUrl,
		description: `电子科技大学研究生院通知（${typeName}）`,
		item: out
	};
}
//#endregion
export { route };
