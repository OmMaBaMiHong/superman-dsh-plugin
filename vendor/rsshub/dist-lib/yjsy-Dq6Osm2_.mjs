import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as getCookie } from "./pypasswaf-BP7QRns8.mjs";
import { load } from "cheerio";
//#region lib/routes/nuaa/yjsy/yjsy.ts
const host = "http://www.graduate.nuaa.edu.cn/";
const map = /* @__PURE__ */ new Map([
	["tzgg", {
		title: "通知公告 | 南京航空航天大学研究生院",
		suffix: "2145/list.htm"
	}],
	["xwdt", {
		title: "新闻动态 | 南京航空航天大学研究生院",
		suffix: "13276/list.htm"
	}],
	["xsxx", {
		title: "学术信息 | 南京航空航天大学研究生院",
		suffix: "13277/list.htm"
	}],
	["ssfc", {
		title: "师生风采 | 南京航空航天大学研究生院",
		suffix: "13278/list.htm"
	}]
]);
const route = {
	path: "/yjsy/:type/:getDescription?",
	categories: ["university"],
	example: "/nuaa/yjsy/tzgg/getDescription",
	parameters: {
		type: "分类名，见下表",
		getDescription: "是否获取全文"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: true,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "研究生院",
	maintainers: [
		"junfengP",
		"Seiry",
		"Xm798"
	],
	handler,
	description: `| 通知公告 | 新闻动态 | 学术信息 | 师生风采 |
| -------- | -------- | -------- | -------- |
| tzgg     | xwdt     | xsxx     | ssfc     |`
};
async function handler(ctx) {
	const type = ctx.req.param("type");
	const suffix = map.get(type).suffix;
	const getDescription = Boolean(ctx.req.param("getDescription"));
	const link = new URL(suffix, host).href;
	const gotConfig = { headers: { cookie: await getCookie(host) } };
	const $ = load((await got_default(link, gotConfig)).data);
	const list = $("#wp_news_w6 ul li").slice(0, 10).toArray().map((element) => {
		return {
			title: $(element).find("a").text(),
			link: $(element).find("a").attr("href"),
			date: $(element).find("span").text()
		};
	});
	const out = await Promise.all(list.map(async (info) => {
		const title = info.title || "tzgg";
		const date = info.date;
		const itemUrl = new URL(info.link, host).href;
		let description = title + "<br><a href=\"" + itemUrl + "\" target=\"_blank\">查看原文</a>";
		if (getDescription) description = await cache_default.tryGet(itemUrl, async () => {
			const pageType = itemUrl.split(".").at(-1);
			if (pageType === "htm" || pageType === "html") return load((await got_default(itemUrl, gotConfig)).data)(".wp_articlecontent").html() + "<br><hr /><a href=\"" + itemUrl + "\" target=\"_blank\">查看原文</a>";
		});
		return {
			title,
			link: itemUrl,
			description,
			pubDate: parseDate(date)
		};
	}));
	return {
		title: map.get(type).title,
		link,
		description: "南京航空航天大学研究生院RSS",
		item: out
	};
}
//#endregion
export { route };
