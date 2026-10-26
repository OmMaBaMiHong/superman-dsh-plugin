import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/ustc/index.ts
const notice_type = {
	jx: {
		title: "中国科学技术大学 - 教学类通知",
		url: "https://ustc.edu.cn/tzgg/jxltz.htm"
	},
	ky: {
		title: "中国科学技术大学 - 科研类通知",
		url: "https://ustc.edu.cn/tzgg/kyltz.htm"
	},
	gl: {
		title: "中国科学技术大学 - 管理类通知",
		url: "https://ustc.edu.cn/tzgg/glltz.htm"
	},
	fw: {
		title: "中国科学技术大学 - 服务类通知",
		url: "https://ustc.edu.cn/tzgg/fwltz.htm"
	}
};
const route = {
	path: "/news/:type?",
	categories: ["university"],
	example: "/ustc/news/gl",
	parameters: { type: "分类，默认为管理类" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["ustc.edu.cn/"],
		target: "/news"
	}],
	name: "官网通知公告",
	maintainers: ["hang333", "jasongzy"],
	handler,
	url: "ustc.edu.cn/",
	description: `| 教学类 | 科研类 | 管理类 | 服务类 |
| ------ | ------ | ------ | ------ |
| jx     | ky     | gl     | fw     |`
};
async function handler(ctx) {
	const type = ctx.req.param("type") ?? "gl";
	const $ = load((await got_default({
		method: "get",
		url: notice_type[type].url
	})).data);
	let items = $("table[portletmode=simpleList] > tbody > tr.light").toArray().map((element) => {
		const child = $(element).children();
		return {
			title: $(child[1]).find("a").attr("title"),
			link: $(child[1]).find("a").attr("href").startsWith("../") ? new URL($(child[1]).find("a").attr("href"), notice_type[type].url).href : $(child[1]).find("a").attr("href"),
			pubDate: timezone(parseDate($(child[2]).text(), "YYYY-MM-DD"), 8)
		};
	});
	items = await Promise.all(items.filter((item) => item.link).map((item) => cache_default.tryGet(item.link, async () => {
		try {
			item.description = load((await got_default(item.link)).data)("div.v_news_content").html();
		} catch {}
		return item;
	})));
	return {
		title: notice_type[type].title,
		description: notice_type[type].title,
		link: notice_type[type].url,
		item: items
	};
}
//#endregion
export { route };
