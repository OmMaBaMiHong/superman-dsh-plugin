import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as getCookie } from "./pypasswaf-BP7QRns8.mjs";
import { load } from "cheerio";
//#region lib/routes/nuaa/jwc/jwc.ts
const host = "https://aao.nuaa.edu.cn/";
const map = /* @__PURE__ */ new Map([
	["tzgg", {
		title: "通知公告 | 南京航空航天大学教务处",
		suffix: "8222/list.htm"
	}],
	["jxfw", {
		title: "教学服务 | 南京航空航天大学教务处",
		suffix: "8230/list.htm"
	}],
	["xspy", {
		title: "学生培养 | 南京航空航天大学教务处",
		suffix: "8231/list.htm"
	}],
	["jxjs", {
		title: "教学建设 | 南京航空航天大学教务处",
		suffix: "8232/list.htm"
	}],
	["jxzy", {
		title: "教学资源 | 南京航空航天大学教务处",
		suffix: "8233/list.htm"
	}]
]);
const route = {
	path: "/jwc/:type/:getDescription?",
	categories: ["university"],
	example: "/nuaa/jwc/tzgg/getDescription",
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
	name: "教务处",
	maintainers: [
		"arcosx",
		"Seiry",
		"qrzbing",
		"Xm798"
	],
	handler,
	description: `| 通知公告 | 教学服务 | 教学建设 | 学生培养 | 教学资源 |
| -------- | -------- | -------- | -------- | -------- |
| tzgg     | jxfw     | jxjs     | xspy     | jxzy     |`
};
async function handler(ctx) {
	const type = ctx.req.param("type");
	const suffix = map.get(type).suffix;
	const getDescription = Boolean(ctx.req.param("getDescription"));
	const link = new URL(suffix, host).href;
	const gotConfig = { headers: { cookie: await getCookie(host) } };
	const $ = load((await got_default(link, gotConfig)).data);
	const list = $("#news_list .news_ul .p-list-item a").slice(0, 10).toArray().map((element) => {
		return {
			title: $(element).find(".text .title").text(),
			link: $(element).attr("href"),
			date: $(element).find(".date em").text() + "-" + $(element).find(".date span").text()
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
		description: "南京航空航天大学教务处RSS",
		item: out
	};
}
//#endregion
export { route };
