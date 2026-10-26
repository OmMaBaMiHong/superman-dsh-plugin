import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { load } from "cheerio";
//#region lib/routes/ustc/sist.ts
const map = /* @__PURE__ */ new Map([["tzgg", {
	title: "中国科学技术大学信息科学技术学院 - 通知公告",
	id: "5142"
}], ["zsgz", {
	title: "中国科学技术大学信息科学技术学院 - 招生工作",
	id: "5108"
}]]);
const host = "https://sist.ustc.edu.cn";
const route = {
	path: "/sist/:type?",
	categories: ["university"],
	example: "/ustc/sist/tzgg",
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
		source: ["sist.ustc.edu.cn/"],
		target: "/sist"
	}],
	name: "信息科学技术学院",
	maintainers: ["jasongzy"],
	handler,
	url: "sist.ustc.edu.cn/",
	description: `| 通知公告 | 招生工作 |
| -------- | -------- |
| tzgg     | zsgz     |`
};
async function handler(ctx) {
	const type = ctx.req.param("type") ?? "tzgg";
	const info = map.get(type);
	if (!info) throw new InvalidParameterError("invalid type");
	const id = info.id;
	const $ = load((await got_default(`${host}/${id}/list.htm`)).data);
	let items = $("div[portletmode=simpleList]").find("div.card").toArray().map((item) => {
		item = $(item);
		const title = item.find(".card-title > a").attr("title").trim();
		let link = item.find(".card-title > a").attr("href");
		link = link.startsWith("/") ? host + link : link;
		return {
			title,
			pubDate: timezone(parseDate(item.find("time").text().replace("发布时间：", ""), "YYYY-MM-DD"), 8),
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
		title: info.title,
		link: `${host}/${id}/list.htm`,
		item: items
	};
}
//#endregion
export { route };
