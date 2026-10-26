import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { load } from "cheerio";
//#region lib/routes/uestc/jwc.ts
const baseUrl = "https://www.jwc.uestc.edu.cn/";
const detailUrl = "https://www.jwc.uestc.edu.cn/info/";
const dateTimeRegex = /(\d{4}-\d{2}-\d{2} \d{2}:\d{2})/;
const typeUrlMap = {
	important: "hard/?page=1",
	student: "list/256/?page=1",
	teacher: "list/255/?page=1",
	teaching: "list/40/?page=1",
	office: "list/ff80808160bcf79c0160c010a8d20020/?page=1"
};
const typeNameMap = {
	important: "重要公告",
	student: "学生事务公告",
	teacher: "教师事务公告",
	teaching: "教学新闻",
	office: "办公室"
};
const route = {
	path: "/jwc/:type?",
	categories: ["university"],
	example: "/uestc/jwc/student",
	parameters: { type: "默认为 `important`" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["www.jwc.uestc.edu.cn/"],
		target: "/jwc"
	}],
	name: "教务处",
	maintainers: ["achjqz", "mobyw"],
	handler,
	url: "www.jwc.uestc.edu.cn/",
	description: `\
| 重要公告  | 学生事务公告 | 教师事务公告 | 教学新闻 | 办公室 |
| --------- | ------------ | ------------ | -------- | ------ |
| important | student      | teacher      | teaching | office |`
};
async function handler(ctx) {
	const type = ctx.req.param("type") || "important";
	if (!Object.hasOwn(typeUrlMap, type)) throw new InvalidParameterError("type not supported");
	const typeName = typeNameMap[type];
	const $ = load(await rofetch(baseUrl + typeUrlMap[type]));
	const items = $("div.textAreo.clearfix").toArray().map(async (entry) => {
		const element = $(entry);
		const newsTitle = element.find("a").attr("title") ?? "";
		const newsLink = detailUrl + element.find("a").attr("newsid");
		return await cache_default.tryGet(newsLink, async () => {
			const content = load(await rofetch(newsLink));
			const basicInfo = content("div.detail_header").find("div.item").text();
			const match = dateTimeRegex.exec(basicInfo);
			return {
				title: newsTitle,
				link: newsLink,
				pubDate: match ? timezone(parseDate(match[1]), 8) : null,
				description: content("div.NewText").html()
			};
		});
	});
	const out = await Promise.all(items);
	return {
		title: `教务处通知（${typeName}）`,
		link: baseUrl,
		description: `电子科技大学教务处通知（${typeName}）`,
		item: out
	};
}
//#endregion
export { route };
