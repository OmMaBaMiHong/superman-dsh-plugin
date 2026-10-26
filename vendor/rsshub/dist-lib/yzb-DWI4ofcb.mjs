import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
import iconv from "iconv-lite";
//#region lib/routes/tju/yzb/index.ts
const yzb_base_url = "http://yzb.tju.edu.cn/";
const repo_url = "https://github.com/DIYgod/RSSHub/issues";
const pageType = (href) => {
	if (href === void 0) return "unknown";
	if (!href.startsWith("http")) return "in-site";
	return new URL(href).hostname === "yzb.tju.edu.cn" ? "tju-yzb" : "unknown";
};
const route = {
	path: "/yzb/:type?",
	categories: ["university"],
	example: "/tju/yzb/notice",
	parameters: { type: "default `notice`" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Admission Office of Graduate",
	maintainers: ["SuperPung"],
	handler,
	description: `| School-level Notice | Master | Doctor | On-the-job Degree |
| :-----------------: | :----: | :----: | :---------------: |
|        notice       | master | doctor |        job        |`
};
async function handler(ctx) {
	const { type } = ctx.req.param();
	let path, subtitle;
	switch (type) {
		case "notice":
			subtitle = "校级公告";
			path = "xwzx/zxxx/";
			break;
		case "master":
			subtitle = "统考硕士";
			path = "xwzx/tkss_xw/";
			break;
		case "doctor":
			subtitle = "统考博士";
			path = "xwzx/tkbs_xw/";
			break;
		case "job":
			subtitle = "在职学位";
			path = "xwzx/zzxw/";
			break;
		default:
			subtitle = "校级公告";
			path = "xwzx/zxxx/";
	}
	let response = null;
	try {
		response = await got_default(yzb_base_url + path, {
			headers: { Referer: yzb_base_url },
			responseType: "buffer"
		});
	} catch {}
	if (response === null) return {
		title: "天津大学研究生招生网 - " + subtitle,
		link: yzb_base_url + path,
		description: "链接失效http://yzb.tju.edu.cn/" + path,
		item: [{
			title: "提示信息",
			link: repo_url,
			description: `<h2>请到<a href=${repo_url}>此处</a>提交Issue</h2>`
		}]
	};
	const $ = load(iconv.decode(response.data, "gbk"));
	const list = $("td.table_left_right > table > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(1) > td > table > tbody > tr").slice(1, -1).toArray().map((item) => {
		const href = $("td > a", item).attr("href");
		const type = pageType(href);
		return {
			title: $("td > a", item).text(),
			link: type === "in-site" ? yzb_base_url + path + href : href,
			pubDate: timezone(parseDate($(".font_10_time", item).text().slice(2, -2), "YYYY-MM-DD"), 8),
			type
		};
	});
	const items = await Promise.all(list.map((item) => {
		switch (item.type) {
			case "tju-yzb":
			case "in-site": return cache_default.tryGet(item.link, async () => {
				try {
					const detailResponse = await got_default(item.link, { responseType: "buffer" });
					const content = load(iconv.decode(detailResponse.data, "gbk"));
					content(".font_18_b").remove();
					content(".font_grey_en").remove();
					item.description = content(".nav_a10 > table > tbody").html();
				} catch {}
				return item;
			});
			default: return item;
		}
	}));
	return {
		title: "天津大学研究生招生网 - " + subtitle,
		link: yzb_base_url + path,
		item: items
	};
}
//#endregion
export { route };
