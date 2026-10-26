import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/hdu/auto/utils.ts
const BASE_URL = "https://auto.hdu.edu.cn";
const fetchAutoNews = async (path, title) => {
	const link = `${BASE_URL}/${path}`;
	const $ = load((await got_default(link)).data);
	const list = $(".rightlist").toArray().map((item) => {
		const $item = $(item);
		const $a = $item.find(".newstitle a");
		const href = $a.attr("href");
		const title = $a.text().trim();
		const dateMatch = $item.find(".newsinfo").text().match(/日期：(\d{4}\/\d{2}\/\d{2})/);
		const brief = $item.find(".newsbrief").text().trim();
		return {
			title: title || "无标题",
			link: href ? new URL(href, BASE_URL).href : BASE_URL,
			pubDate: dateMatch ? parseDate(dateMatch[1], "YYYY/MM/DD") : void 0,
			description: brief || ""
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const { data } = await got_default(item.link);
		const description = load(data)(".wp_articlecontent").html();
		return {
			...item,
			description: description || item.description
		};
	})));
	return {
		title: `杭州电子科技大学自动化学院 - ${title}`,
		link,
		item: items
	};
};
//#endregion
//#region lib/routes/hdu/auto/notice.ts
const typeMap = {
	notice: {
		name: "通知公告",
		path: "3779/list.htm"
	},
	graduate: {
		name: "研究生教育",
		path: "3754/list.htm"
	},
	undergraduate: {
		name: "本科教学",
		path: "3745/list.htm"
	},
	student: {
		name: "学生工作",
		path: "3726/list.htm"
	}
};
const route = {
	path: "/auto/:type?",
	categories: ["university"],
	example: "/hdu/auto",
	parameters: { type: "分类，见下表，默认为通知公告" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "自动化学院",
	maintainers: ["jalenzz"],
	handler: (ctx) => {
		let type = ctx.req.param("type") || "notice";
		if (!Object.hasOwn(typeMap, type)) {
			logger.error(`Invalid type: ${type}. Valid types are: ${Object.keys(typeMap).join(", ")}, defaulting to notice`);
			type = "notice";
		}
		return fetchAutoNews(typeMap[type].path, typeMap[type].name);
	},
	description: `| 通知公告 | 研究生教育 | 本科教学      | 学生工作 |
| -------- | ---------- | ------------- | -------- |
| notice   | graduate   | undergraduate | student  |`,
	radar: [
		{
			source: ["auto.hdu.edu.cn/main.htm", "auto.hdu.edu.cn/3779/list.htm"],
			target: "/auto/notice"
		},
		{
			source: ["auto.hdu.edu.cn/main.htm", "auto.hdu.edu.cn/3754/list.htm"],
			target: "/auto/graduate"
		},
		{
			source: ["auto.hdu.edu.cn/main.htm", "auto.hdu.edu.cn/3745/list.htm"],
			target: "/auto/undergraduate"
		},
		{
			source: ["auto.hdu.edu.cn/main.htm", "auto.hdu.edu.cn/3726/list.htm"],
			target: "/auto/student"
		}
	]
};
//#endregion
export { route };
