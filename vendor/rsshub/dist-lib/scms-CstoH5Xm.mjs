import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/ustc/scms.ts
const map = /* @__PURE__ */ new Map([
	["kydt", {
		title: "科研动态",
		id: "2404"
	}],
	["tzgg", {
		title: "通知公告",
		id: "2402"
	}],
	["xshd", {
		title: "学术活动",
		id: "xshd"
	}],
	["ynxw", {
		title: "院内新闻",
		id: "2405"
	}]
]);
const host = "https://scms.ustc.edu.cn";
const route = {
	path: "/scms/:type?",
	categories: ["university"],
	example: "/ustc/scms/tzgg",
	parameters: { type: "分类，见下表，默认为通知公告" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["scms.ustc.edu.cn/:id/list.htm"],
		target: "/scms"
	}],
	name: "化学与材料科学学院",
	maintainers: ["boxie123"],
	handler,
	url: "scms.ustc.edu.cn/",
	description: `| 院内新闻 | 通知公告 | 科研动态 | 学术活动 | 其他      |
| -------- | -------- | -------- | -------- | --------- |
| ynxw     | tzgg     | kydt     | xshd     | 自定义 id |`
};
async function handler(ctx) {
	const type = ctx.req.param("type") ?? "tzgg";
	const info = map.get(type);
	const id = info?.id ?? type;
	const $ = load((await got_default(`${host}/${id}/list.htm`)).data);
	const pageTitle = info?.title ?? $("head > title").text();
	let items = $("#wp_news_w6 > .wp_article_list > .list_item").toArray().map((item) => {
		const elem = $(item);
		const title = elem.find(".Article_Title > a").attr("title").trim();
		let link = elem.find(".Article_Title > a").attr("href");
		link = link.startsWith("/") ? host + link : link;
		return {
			title,
			pubDate: timezone(parseDate(elem.find(".Article_PublishDate").text(), "YYYY-MM-DD"), -4),
			link
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		try {
			item.description = load((await got_default(item.link)).data)("div.wp_articlecontent").html();
		} catch {}
		return item;
	})));
	return {
		title: `中国科学技术大学化学与材料科学学院 - ${pageTitle}`,
		link: `${host}/${id}/list.htm`,
		item: items
	};
}
//#endregion
export { route };
