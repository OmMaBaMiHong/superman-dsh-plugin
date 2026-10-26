import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { load } from "cheerio";
//#region lib/routes/ustc/eeis.ts
const map = /* @__PURE__ */ new Map([["tzgg", {
	title: "中国科学技术大学电子工程与信息科学系 - 通知公告",
	id: "2702"
}], ["xwxx", {
	title: "中国科学技术大学电子工程与信息科学系 - 新闻信息",
	id: "2706"
}]]);
const host = "https://eeis.ustc.edu.cn";
const route = {
	path: "/eeis/:type?",
	categories: ["university"],
	example: "/ustc/eeis/tzgg",
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
		source: ["eeis.ustc.edu.cn/"],
		target: "/eeis"
	}],
	name: "电子工程与信息科学系",
	maintainers: ["jasongzy"],
	handler,
	url: "eeis.ustc.edu.cn/",
	description: `| 通知公告 | 新闻信息 |
| -------- | -------- |
| tzgg     | xwxx     |`
};
async function handler(ctx) {
	const type = ctx.req.param("type") ?? "tzgg";
	const info = map.get(type);
	if (!info) throw new InvalidParameterError("invalid type");
	const id = info.id;
	const $ = load((await got_default(`${host}/${id}/list.htm`)).data);
	const list = $("div[portletmode=simpleList]").find("article").toArray().map((item) => {
		item = $(item);
		const title = item.find("h4 > a").eq(1).attr("title").trim();
		let link = item.find("h4 > a").attr("href");
		link = link.startsWith("/") ? host + link : link;
		return {
			title,
			pubDate: timezone(parseDate(item.find(".post-date > time").text().replace("发布时间：", ""), "YYYY-MM-DD"), 8),
			link
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		try {
			item.description = load((await got_default(item.link)).data)("div.wp_articlecontent").html();
		} catch {}
		return item;
	})));
	return {
		title: info.title,
		link: `${host}/${id}/list.htm`,
		item: items
	};
}
//#endregion
export { route };
