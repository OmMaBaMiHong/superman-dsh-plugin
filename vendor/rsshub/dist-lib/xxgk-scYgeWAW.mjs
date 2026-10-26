import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/shu/xxgk.ts
const noticeType = {
	dwjlxm: {
		title: "上海大学信息公开网-信息公开栏目-国际合作与交流-对外交流项目",
		url: "https://xxgk.shu.edu.cn/xxgklm/gjhzyjl1/dwjlxm.htm"
	},
	hzjl: {
		title: "上海大学信息公开网-信息公开栏目-国际合作与交流-合作交流",
		url: "https://xxgk.shu.edu.cn/xxgklm/gjhzyjl1/hzjl.htm"
	}
};
const route = {
	path: "/xxgk/:type?",
	categories: ["university"],
	example: "/shu/xxgk/dwjlxm",
	parameters: { type: "分类，默认为对外交流项目" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["xxgk.shu.edu.cn/"],
		target: "/xxgk"
	}],
	name: "信息公开网",
	maintainers: ["GhhG123"],
	handler,
	url: "xxgk.shu.edu.cn/",
	description: `| 对外交流项目 | 合作交流 |
| ------------ | -------- |
| dwjlxm       | hzjl     |`
};
async function handler(ctx) {
	const type = ctx.req.param("type") ?? "dwjlxm";
	const rootUrl = "https://xxgk.shu.edu.cn";
	const $ = load((await got_default({
		method: "get",
		url: noticeType[type].url
	})).data);
	const list = $("li[id^=\"line_u6_\"]").toArray().map((el) => {
		const item = $(el);
		const a = item.find("a");
		const rawLink = a.attr("href");
		const title = a.text().trim();
		const pubDate = item.find("i").text().trim();
		return {
			title,
			link: rawLink ? new URL(rawLink, rootUrl).href : rootUrl,
			pubDate: timezone(parseDate(pubDate, "YYYY/MM/DD"), 8),
			description: ""
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
		})).data)(".v_news_content").html() || item.description;
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
