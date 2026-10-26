import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as getCookie } from "./pypasswaf-BP7QRns8.mjs";
import { load } from "cheerio";
//#region lib/routes/nuaa/college/cae.ts
const host = "https://cae.nuaa.edu.cn/";
const map = /* @__PURE__ */ new Map([
	["zhxw", {
		title: "综合新闻 | 南京航空航天大学自动化学院",
		suffix: "5399/list.htm"
	}],
	["dwxz", {
		title: "党委行政 | 南京航空航天大学自动化学院",
		suffix: "13266/list.htm"
	}],
	["rshz", {
		title: "人事/合作 | 南京航空航天大学自动化学院",
		suffix: "13267/list.htm"
	}],
	["yjs", {
		title: "研究生培养 | 南京航空航天大学自动化学院",
		suffix: "13271/list.htm"
	}],
	["bks", {
		title: "本科生培养 | 南京航空航天大学自动化学院",
		suffix: "13270/list.htm"
	}],
	["xsgz", {
		title: "学生工作 | 南京航空航天大学自动化学院",
		suffix: "13268/list.htm"
	}],
	["tzgg", {
		title: "通知公告 | 南京航空航天大学自动化学院",
		suffix: "13264/list.htm"
	}],
	["xsxx", {
		title: "学术信息 | 南京航空航天大学自动化学院",
		suffix: "13265/list.htm"
	}],
	["dbgg", {
		title: "答辩公告 | 南京航空航天大学自动化学院",
		suffix: "dbgg/list.htm"
	}]
]);
const route = {
	path: "/cae/:type/:getDescription?",
	name: "Unknown",
	maintainers: ["Xm798"],
	handler
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
		description: "南京航空航天大学自动化学院RSS",
		item: out
	};
}
//#endregion
export { route };
