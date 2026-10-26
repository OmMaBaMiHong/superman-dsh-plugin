import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/hitsz/due.ts
const handler = async (ctx) => {
	const baseUrl = "http://due.hitsz.edu.cn";
	const categoryGroups = {
		teaching: [
			"jwxw/jwgl",
			"jwxw/kwgl",
			"jwxw/zcgl",
			"jwxw/xkgl",
			"jwxw/cjgl"
		],
		studentStatus: ["jwxw/xjgl_b_", "jwxw/xjgl_y_"],
		teachingSupport: ["jwxw/jxxxh", "jwxw/jzxj"],
		education: [
			"xwgl/bksxw",
			"xwgl/ssxwpy/ktyzj",
			"xwgl/bsxwpy/qqhj1"
		]
	};
	const { type = "all" } = ctx.req.param();
	const validType = Object.keys(categoryGroups).includes(type) ? type : "all";
	const categories = validType === "all" ? Object.values(categoryGroups).flat() : categoryGroups[validType];
	const pagePromises = categories.map(async (category) => {
		const pageUrl = new URL(`${category}.htm`, baseUrl).href;
		try {
			return await got_default(pageUrl);
		} catch {
			return null;
		}
	});
	return {
		title: "哈尔滨工业大学（深圳）教务部-教务学务与学位管理-所有栏目新闻汇总",
		description: "哈尔滨工业大学（深圳）教务部中教务学务和学位管理所有栏目的最新新闻汇总，包括教务管理、考务管理、注册管理、选课管理、成绩管理、学籍管理、教学信息化、奖助学金、本科生新闻、硕士学位培养、博士学位培养等",
		link: "http://due.hitsz.edu.cn/jwxw/jwgl.htm",
		item: (await Promise.all(pagePromises)).flatMap((response, i) => {
			if (!response) return [];
			const category = categories[i];
			const $ = load(response.data);
			return $("ul.box-main-list li, .list-main li, .list-main-modular li").toArray().map((el) => {
				const $el = $(el);
				const linkUrl = $el.find("a").attr("href");
				if (!linkUrl) return null;
				const title = $el.find("span").text().trim();
				const pubDateStr = $el.find("label").text().trim();
				return {
					title,
					link: new URL(linkUrl, baseUrl).href,
					pubDate: pubDateStr ? timezone(parseDate(pubDateStr), 8) : null,
					category,
					description: title
				};
			}).filter(Boolean);
		}).filter(Boolean).filter((item) => !item.title.includes("统一身份认证平台")),
		author: "哈尔滨工业大学（深圳）教务部"
	};
};
const route = {
	path: "/due/general/:type?",
	name: "教务部教务学务与学位管理所有栏目",
	url: "due.hitsz.edu.cn",
	maintainers: ["guohuiyuan"],
	handler,
	example: "/hitsz/due/general",
	parameters: { type: {
		description: "栏目类型筛选，默认all（所有栏目）",
		options: [
			{
				value: "all",
				label: "所有栏目"
			},
			{
				value: "teaching",
				label: "教务核心业务"
			},
			{
				value: "studentStatus",
				label: "学籍相关"
			},
			{
				value: "teachingSupport",
				label: "教学支持"
			},
			{
				value: "education",
				label: "学生培养"
			}
		],
		default: "all"
	} },
	description: `哈尔滨工业大学（深圳）教务部中教务学务和学位管理所有栏目的最新新闻汇总。

#### 栏目分组说明

支持按业务类型筛选，使用路径参数指定分组：

- \`type=teaching\` - 教务核心业务：教务管理、考务管理、注册管理、选课管理、成绩管理
- \`type=studentStatus\` - 学籍相关：本科生学籍管理、研究生学籍管理
- \`type=teachingSupport\` - 教学支持：教学信息化、奖助学金
- \`type=education\` - 学生培养：本科生新闻、硕士学位培养、博士学位培养
- \`type=all\` 或省略 - 所有栏目（默认）

#### 包含栏目：

- [教务管理](http://due.hitsz.edu.cn/jwxw/jwgl.htm)
- [考务管理](http://due.hitsz.edu.cn/jwxw/kwgl.htm)
- [注册管理](http://due.hitsz.edu.cn/jwxw/zcgl.htm)
- [选课管理](http://due.hitsz.edu.cn/jwxw/xkgl.htm)
- [成绩管理](http://due.hitsz.edu.cn/jwxw/cjgl.htm)
- [学籍管理（本）](http://due.hitsz.edu.cn/jwxw/xjgl_b_.htm)
- [学籍管理（研）](http://due.hitsz.edu.cn/jwxw/xjgl_y_.htm)
- [教学信息化](http://due.hitsz.edu.cn/jwxw/jxxxh.htm)
- [奖助学金](http://due.hitsz.edu.cn/jwxw/jzxj.htm)
- [本科生新闻](http://due.hitsz.edu.cn/xwgl/bksxw.htm)
- [硕士学位培养](http://due.hitsz.edu.cn/xwgl/ssxwpy/ktyzj.htm)
- [博士学位培养](http://due.hitsz.edu.cn/xwgl/bsxwpy/qqhj1.htm)`,
	categories: ["university"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportRadar: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["due.hitsz.edu.cn/jwxw/jwgl.htm"],
		target: "/hitsz/due/general"
	}]
};
//#endregion
export { handler, route };
