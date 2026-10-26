import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { load } from "cheerio";
//#region lib/routes/ustc/math.ts
const map = /* @__PURE__ */ new Map([
	["xyxw", {
		title: "中国科学技术大学数学科学学院 - 学院新闻",
		id: "xyxw"
	}],
	["tzgg", {
		title: "中国科学技术大学数学科学学院 - 通知公告",
		id: "tzgg"
	}],
	["xsjl", {
		title: "中国科学技术大学数学科学学院 - 学术交流",
		id: "xsjl"
	}],
	["xsbg", {
		title: "中国科学技术大学数学科学学院 - 学术报告",
		id: "xsbg_18822"
	}]
]);
const host = "https://math.ustc.edu.cn";
const route = {
	path: "/math/:type?",
	categories: ["university"],
	example: "/ustc/math/tzgg",
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
		source: ["math.ustc.edu.cn/"],
		target: "/math"
	}],
	name: "数学科学学院",
	maintainers: ["ne0-wu"],
	handler,
	url: "math.ustc.edu.cn/",
	description: `| 学院新闻 | 通知公告 | 学术交流 | 学术报告 |
| -------- | -------- | -------- | -------- |
| xyxw     | tzgg     | xsjl     | xsbg     |`
};
async function handler(ctx) {
	const type = ctx.req.param("type") ?? "tzgg";
	const info = map.get(type);
	if (!info) throw new InvalidParameterError("invalid type");
	const id = info.id;
	const $ = load((await got_default(`${host}/${id}/list.htm`)).data);
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
		title: info.title,
		link: `${host}/${id}/list.htm`,
		item: items
	};
}
//#endregion
export { route };
