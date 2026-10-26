import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/shu/xykd.ts
const noticeType = {
	whxx: {
		title: "上海大学 - 文化信息",
		url: "https://www.shu.edu.cn/xnrc/whxx.htm"
	},
	xsbg: {
		title: "上海大学 - 学术报告",
		url: "https://www.shu.edu.cn/xnrc/xsbg.htm"
	}
};
const route = {
	path: "/xykd/:type?",
	categories: ["university"],
	example: "/shu/xykd/xsbg",
	parameters: { type: "分类，默认为学术公告" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["www.shu.edu.cn/"],
		target: "/xykd"
	}],
	name: "校园看点",
	maintainers: ["GhhG123"],
	handler,
	url: "www.shu.edu.cn/",
	description: `| 文化信息 | 学术报告 |
| -------- | -------- |
| whxx     | xsbg     |`
};
async function handler(ctx) {
	const type = ctx.req.param("type") ?? "xsbg";
	const rootUrl = "https://www.shu.edu.cn";
	const $ = load((await got_default({
		method: "get",
		url: noticeType[type].url
	})).data);
	const list = $("div.xsbg_list ul li").toArray().map((el) => {
		const item = $(el);
		const rawLink = item.find("a").attr("href");
		const dateParts = item.find("div.sj p").toArray().map((p) => $(p).text().trim());
		return {
			title: item.find("p.bt").text().trim(),
			link: rawLink ? new URL(rawLink, rootUrl).href : rootUrl,
			pubDate: timezone(parseDate(`${dateParts[1]}-${dateParts[0]}`, "MM-DD"), 8),
			description: item.find("div.zy").text().trim()
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = load((await got_default({
			method: "get",
			url: item.link
		})).data)("#vsb_content_500 .v_news_content").html() || item.description;
		return item;
	})));
	return {
		title: noticeType[type].title,
		description: noticeType[type].title,
		link: noticeType[type].url,
		image: "https://www.shu.edu.cn/__local/0/08/C6/1EABE492B0CF228A5564D6E6ABE_779D1EE3_5BF7.png",
		item: items
	};
}
//#endregion
export { route };
