import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { load } from "cheerio";
//#region lib/routes/ustc/gs.ts
const map = /* @__PURE__ */ new Map([["tzgg", {
	title: "中国科学技术大学研究生院 - 通知公告",
	id: "9"
}], ["xwdt", {
	title: "中国科学技术大学研究生院 - 新闻动态",
	id: "10"
}]]);
const host = "https://gradschool.ustc.edu.cn";
const route = {
	path: "/gs/:type?",
	categories: ["university"],
	example: "/ustc/gs/tzgg",
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
		source: ["gradschool.ustc.edu.cn/"],
		target: "/gs"
	}],
	name: "研究生院",
	maintainers: ["jasongzy"],
	handler,
	url: "gradschool.ustc.edu.cn/",
	description: `| 通知公告 | 新闻动态 |
| -------- | -------- |
| tzgg     | xwdt     |`
};
async function handler(ctx) {
	const type = ctx.req.param("type") ?? "tzgg";
	const info = map.get(type);
	if (!info) throw new InvalidParameterError("invalid type");
	const id = info.id;
	const $ = load((await got_default(`${host}/column/${id}`)).data);
	let items = $("div.r-box > ul").find("li").toArray().map((item) => {
		item = $(item);
		const title = item.find("a").text().trim();
		const link = item.find("a").attr("href").startsWith("/article") ? host + item.find("a").attr("href") : item.find("a").attr("href");
		return {
			title,
			pubDate: timezone(parseDate(item.find("time").text(), "YYYY-MM-DD"), 8),
			link
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		try {
			item.description = load((await got_default(item.link)).data)("article.article").html();
		} catch {}
		return item;
	})));
	return {
		title: info.title,
		link: `${host}/column/${id}`,
		item: items
	};
}
//#endregion
export { route };
