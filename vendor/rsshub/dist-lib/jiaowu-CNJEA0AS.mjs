import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/buaa/jiaowu.ts
const BASE_URL = "https://jiaowu.buaa.edu.cn/bhjwc2.0/index/newsList.do";
const route = {
	path: "/jiaowu/:cddm?",
	name: "教务部",
	url: "jiaowu.buaa.edu.cn",
	maintainers: ["OverflowCat"],
	handler,
	example: "/buaa/jiaowu/02",
	parameters: { cddm: "菜单代码，可以是 2 位或者 4 位，默认为 `02`（通知公告）" },
	description: `::: tip

菜单代码（\`cddm\`）应填写链接中调用的 newsList 接口的参数，可以是 2 位或者 4 位数字。若为 2 位，则为 \`fcd\`（父菜单）；若为 4 位，则为 \`cddm\`（菜单代码），其中前 2 位为 \`fcd\`。
示例：

1. 新闻快讯页面的链接中 \`onclick="javascript:onNewsList('03');return false;"\`，对应的路径参数为 \`03\`，完整路由为 \`/buaa/jiaowu/03\`；
2. 通知公告 > 公示专区页面的链接中 \`onclick="javascript:onNewsList2('0203','2');return false;"\`，对应的路径参数为 \`0203\`，完整路由为 \`/buaa/jiaowu/0203\`。

:::`,
	categories: ["university"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportRadar: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	}
};
async function handler(ctx) {
	let cddm = ctx.req.param("cddm");
	if (!cddm) cddm = "02";
	if (cddm.length !== 2 && cddm.length !== 4) throw new Error("cddm should be 2 or 4 digits");
	const { title, list } = await getList(BASE_URL, {
		id: "",
		fcdTab: cddm.slice(0, 2),
		cddmTab: cddm,
		xsfsTab: "2",
		tplbid: "",
		xwid: "",
		zydm: "",
		zymc: "",
		yxdm: "",
		pyzy: "",
		szzqdm: ""
	});
	return {
		title,
		item: await getItems(list),
		link: BASE_URL,
		author: "北航教务部",
		language: "zh-CN"
	};
}
function getArticleUrl(onclick) {
	if (!onclick) return null;
	const xwid = onclick.match(/'(\d+)'/)?.at(1);
	if (!xwid) return null;
	return `http://jiaowu.buaa.edu.cn/bhjwc2.0/index/newsView.do?xwid=${xwid}`;
}
async function getList(url, form = {}) {
	const { body } = await got_default.post(url, { form });
	const $ = load(body);
	return {
		title: $("#main > div.dqwz > a").last().text() || "北京航空航天大学教务部",
		list: $("#main div.news_list > ul > li").toArray().map((item) => {
			const $ = load(item);
			const link = getArticleUrl($("a").attr("onclick"));
			if (link === null) return null;
			return {
				title: $("a").text(),
				link,
				pubDate: timezone(parseDate($("span.Floatright").text()), 8)
			};
		}).filter((item) => item !== null)
	};
}
function getItems(list) {
	return Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: descrptionResponse } = await got_default(item.link);
		const $descrption = load(descrptionResponse);
		item.description = $descrption("#main > div.content > div.search_height > div.search_con:has(p)").html()?.replaceAll(/(\r|\n)+/g, "<br />");
		item.author = $descrption("#main > div.content > div.search_height > span.search_con").text().split("发布者:").at(-1) || "教务部";
		return item;
	})));
}
//#endregion
export { route };
