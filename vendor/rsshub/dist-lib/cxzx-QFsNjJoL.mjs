import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as getPageItemAndDate } from "./utils-BoqNULgv.mjs";
import { load } from "cheerio";
//#region lib/routes/jsu/cxzx.ts
const route = {
	path: "/cxzx/:types?",
	name: "Unknown",
	maintainers: ["wenjia03"],
	handler
};
async function handler(ctx) {
	const { types = "xkjs" } = ctx.req.param();
	const baseUrl = "https://cxzx.jsu.edu.cn/";
	const urls = {
		tzgg: {
			url: "https://cxzx.jsu.edu.cn/xwzx.htm",
			title: "通知公告"
		},
		xkjs: {
			url: "https://cxzx.jsu.edu.cn/xwzx/zxdt.htm",
			title: "学科竞赛公告"
		},
		cxtz: {
			url: "https://cxzx.jsu.edu.cn/cxlt/xsjz1.htm",
			title: "创新项目公告"
		},
		jsxw: {
			url: "https://cxzx.jsu.edu.cn/cxjs.htm",
			title: "竞赛新闻"
		},
		jstz: {
			url: "https://cxzx.jsu.edu.cn/cxjs/xkjs.htm",
			title: "竞赛新闻 -> 通知公告"
		}
	};
	const $ = load((await got_default({
		method: "get",
		url: urls[types].url
	})).data);
	const list = $("tr[height=\"20\"]").toArray();
	const out = await Promise.all(list.map((item) => {
		item = $(item);
		const link = new URL(item.find("td:nth-child(2) > a").attr("href"), baseUrl).href;
		return cache_default.tryGet(link, async () => {
			const title = item.find("td:nth-child(2) > a").text() || "无标题";
			const category = urls[types].title;
			const description = await getPageItemAndDate("#vsb_newscontent", link, "body > div.cx_big_container > div.cx_content_container > div.cx_right_part > div.viewbox > form > table > tbody > tr:nth-child(1) > td", "body > div.cx_big_container > div.cx_content_container > div.cx_right_part > div.viewbox > form > table > tbody > tr:nth-child(2) > td > span.timestyle134612");
			const pubDate = parseDate(description.date);
			return {
				title,
				link,
				pubDate,
				description: description.pageInfo,
				category
			};
		});
	}));
	return {
		title: `吉首大学创新中心 - ${urls[types].title}`,
		link: urls[types].url,
		description: "吉首大学创新中心",
		item: out
	};
}
//#endregion
export { route };
