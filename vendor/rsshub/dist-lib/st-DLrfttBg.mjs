import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { n as processArticle, t as cookieJar } from "./utils-BOqrKF_e.mjs";
import { load } from "cheerio";
//#region lib/routes/playno1/st.ts
const baseUrl = "http://stno1.playno1.com";
const route = {
	path: "/st/:catid?",
	categories: ["bbs"],
	example: "/playno1/st",
	parameters: { catid: "分类，见下表，默认为全部文章" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["stno1.playno1.com/stno1/:catid/"],
		target: "/st/:catid"
	}],
	name: "情趣",
	maintainers: ["TonyRL"],
	handler,
	description: `| 全部文章 | 情趣體驗報告 | 情趣新聞 | 情趣研究所 |
| -------- | ------------ | -------- | ---------- |
| all      | experience   | news     | graduate   |`
};
async function handler(ctx) {
	const { catid = "all" } = ctx.req.param();
	const url = `${baseUrl}/stno1/${catid}/`;
	const $ = load((await got_default(url, { cookieJar })).data);
	let items = $(".fallsBox").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find(".ftitle a").attr("title"),
			link: item.find(".ftitle a").attr("href"),
			pubDate: timezone(parseDate(item.find(".dateBox").text(), "YYYY-MM-DD HH:mm"), 8),
			author: item.find(".dateBox span a").eq(0).text().trim()
		};
	});
	items = await processArticle(items, cache_default);
	return {
		title: $("head title").text(),
		link: url,
		item: items,
		language: "zh-TW"
	};
}
//#endregion
export { route };
