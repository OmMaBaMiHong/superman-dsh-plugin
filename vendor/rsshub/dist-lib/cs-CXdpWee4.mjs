import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as getCookie } from "./pypasswaf-BP7QRns8.mjs";
import { load } from "cheerio";
//#region lib/routes/nuaa/college/cs.ts
const host = "https://cs.nuaa.edu.cn/";
const map = /* @__PURE__ */ new Map([
	["tzgg", {
		title: "通知公告 | 南京航空航天大学计算机科学与技术学院",
		suffix: "tzgg/list.htm"
	}],
	["rdxw", {
		title: "热点新闻 | 南京航空航天大学计算机科学与技术学院",
		suffix: "10846/list.htm"
	}],
	["xkky", {
		title: "学科科研 | 南京航空航天大学计算机科学与技术学院",
		suffix: "10849/list.htm"
	}],
	["be", {
		title: "本科生培养 | 南京航空航天大学计算机科学与技术学院",
		suffix: "10850/list.htm"
	}],
	["me", {
		title: "研究生培养 | 南京航空航天大学计算机科学与技术学院",
		suffix: "10851/list.htm"
	}],
	["jxdt", {
		title: "教学动态 | 南京航空航天大学计算机科学与技术学院",
		suffix: "1977/list.htm"
	}],
	["xsgz", {
		title: "学生工作 | 南京航空航天大学计算机科学与技术学院",
		suffix: "1959/list.htm"
	}]
]);
const route = {
	path: "/cs/:type/:getDescription?",
	categories: ["university"],
	example: "/nuaa/cs/jxdt",
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
	name: "计算机科学与技术学院",
	maintainers: [
		"LogicJake",
		"Seiry",
		"qrzbing",
		"Xm798"
	],
	handler,
	description: `| 通知公告 | 热点新闻 | 学科科研 | 教学动态 | 本科生培养 | 研究生培养 | 学生工作 |
| -------- | -------- | -------- | -------- | ---------- | ---------- | -------- |
| tzgg     | rdxw     | xkky     | jxdt     | be         | me         | xsgz     |`
};
async function handler(ctx) {
	const type = ctx.req.param("type");
	const getDescription = Boolean(ctx.req.param("getDescription"));
	const suffix = map.get(type).suffix;
	const link = new URL(suffix, host).href;
	const gotConfig = { headers: { cookie: await getCookie(host) } };
	const $ = load((await got_default(link, gotConfig)).data);
	const perCount = Number.parseInt($(".per_count", "#wp_paging_w6").text());
	const allCount = Number.parseInt($(".all_count", "#wp_paging_w6").slice(1).text());
	const list = $("#news_list ul li").slice(0, Math.min(perCount, allCount)).toArray().map((element) => {
		return {
			title: $(element).find("a").attr("title"),
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
		description: "南京航空航天大学计算机科学与技术学院RSS",
		item: out
	};
}
//#endregion
export { route };
