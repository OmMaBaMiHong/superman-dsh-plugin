import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/shu/gs.ts
const noticeType = {
	zhxw: {
		title: "上海大学研究生院-综合新闻",
		url: "https://gs.shu.edu.cn/xwlb/zh.htm"
	},
	pygl: {
		title: "上海大学研究生院-培养管理",
		url: "https://gs.shu.edu.cn/xwlb/py.htm"
	},
	gjjl: {
		title: "上海大学研究生院-国际交流",
		url: "https://gs.shu.edu.cn/xwlb/gjjl.htm"
	}
};
const route = {
	path: "/gs/:type?",
	categories: ["university"],
	example: "/shu/gs/zhxw",
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
		source: ["gs.shu.edu.cn/"],
		target: "/gs"
	}],
	name: "研究生院",
	maintainers: ["GhhG123"],
	handler,
	url: "gs.shu.edu.cn/",
	description: `| 综合新闻 | 培养管理 | 国际交流 |
| -------- | -------- | -------- |
| zhxw     | pygl     | gjjl     |`
};
async function handler(ctx) {
	const type = ctx.req.param("type") ?? "zhxw";
	const rootUrl = "https://gs.shu.edu.cn";
	const $ = load((await got_default({
		method: "get",
		url: noticeType[type].url
	})).data);
	const list = $("tr[id^=\"line_u17_\"]").toArray().map((el) => {
		const item = $(el);
		const rawLink = item.find("a").attr("href");
		const title = item.find("a").text().trim();
		const dateParts = item.find("td").eq(1).text().trim();
		return {
			title,
			link: rawLink ? new URL(rawLink, rootUrl).href : rootUrl,
			pubDate: timezone(parseDate(dateParts, "YYYY/MM/DD HH:mm:ss"), 8),
			description: item.find("td").eq(2).text().trim()
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		if (new URL(item.link).hostname === "gs1.shu.edu.cn") {
			item.description = "gs1.shu.edu.cn, 无法直接获取";
			return item;
		}
		item.description = load((await got_default({
			method: "get",
			url: item.link
		})).data)("#vsb_content .v_news_content").html() || item.description;
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
