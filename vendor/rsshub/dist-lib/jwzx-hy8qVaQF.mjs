import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/hrbust/jwzx.ts
const route = {
	path: "/jwzx/:type?/:page?",
	name: "教务处",
	url: "jwzx.hrbust.edu.cn",
	maintainers: ["LenaNouzen", "cscnk52"],
	handler,
	example: "/hrbust/jwzx",
	parameters: {
		type: "分类编号，默认为 354（教务公告），具体见下表",
		page: "文章数，默认为 12"
	},
	description: `::: tip

- type 可以从 URL 中的 columnId 获取。
- 由于源站未提供精确时间，只能抓取日期粒度的时间。

:::

| 组织机构 | 工作职责 | 专业设置 | 教务信箱 | 名师风采 | 热点新闻 | 教务公告 | 教学新闻 | 教学管理 | 教务管理 | 学籍管理 | 实践教学 | 系统使用动画 | 教学管理 | 教务管理 | 学籍管理 | 实验教学 | 实践教学 | 教研论文教材认定 | 教学管理 | 学籍管理 | 实践教学 | 网络教学 | 多媒体教室管理 | 实验教学与实验室管理 | 教学成果 | 国创计划 | 学科竞赛 | 微专业 | 众创空间 | 示范基地 | 学生社团 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | ------------ | -------- | -------- | -------- | -------- | -------- | ---------------- | -------- | -------- | -------- | -------- | -------------- | -------------------- | -------- | -------- | -------- | ------ | -------- | -------- | -------- |
| 339      | 340      | 342      | 346      | 351      | 353      | 354      | 355      | 442      | 443      | 444      | 445      | 2106         | 2332     | 2333     | 2334     | 2335     | 2336     | 2730             | 2855     | 2857     | 2859     | 3271     | 3508           | 3519                 | 3981     | 4057     | 4058     | 4059   | 4060     | 4061     | 4062     |`,
	categories: ["university"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		supportRadar: true
	},
	radar: [{
		source: ["jwzx.hrbust.edu.cn/homepage/index.do"],
		target: "/jwzx"
	}],
	view: 5
};
async function handler(ctx) {
	const rootUrl = "http://jwzx.hrbust.edu.cn/homepage/";
	const { type = 354, page = 12 } = ctx.req.param();
	const columnUrl = "http://jwzx.hrbust.edu.cn/homepage/infoArticleList.do?columnId=" + type + "&pagingNumberPer=" + page;
	const $ = load(await rofetch(columnUrl));
	const bigTitle = $(".columnTitle .wow span").text().trim();
	const list = $("div.articleList li").toArray().map((item) => {
		const element = $(item);
		const link = new URL(element.find("a").attr("href"), rootUrl).href;
		return {
			title: element.find("a").text().trim(),
			link,
			pubDate: timezone(parseDate(element.find("span").text().trim()), 8)
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		if (!item.link.startsWith(rootUrl)) {
			item.description = "本文需跳转，请点击原文链接后阅读";
			return item;
		}
		const body = load(await rofetch(item.link))("div.body");
		body.find("[style]").removeAttr("style");
		body.find("font").contents().unwrap();
		body.html(body.html()?.replaceAll("&nbsp;", ""));
		body.find("[align]").removeAttr("align");
		item.description = body.html();
		if (item.description === null) item.description = "解析正文失败";
		return item;
	})));
	return {
		title: `${bigTitle} - 哈尔滨理工大学教务处`,
		link: columnUrl,
		language: "zh-CN",
		item: items
	};
}
//#endregion
export { route };
