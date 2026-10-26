import { t as config } from "./config-B5Cf_tHS.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { t as getHeaders } from "./utils-B0H7APTF2.mjs";
import { load } from "cheerio";
//#region lib/routes/smzdm/keyword.ts
const route = {
	path: "/keyword/:keyword",
	categories: ["shopping"],
	view: 5,
	example: "/smzdm/keyword/女装",
	parameters: { keyword: "你想订阅的关键词" },
	features: {
		requireConfig: [{
			name: "SMZDM_COOKIE",
			description: "什么值得买登录后的 Cookie 值"
		}],
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "关键词",
	maintainers: ["DIYgod", "MeanZhang"],
	handler
};
async function handler(ctx) {
	if (!config.smzdm.cookie) throw new ConfigNotFoundError("什么值得买排行榜 is disabled due to the lack of SMZDM_COOKIE");
	const keyword = ctx.req.param("keyword");
	const data = (await got_default("https://search.smzdm.com", {
		headers: {
			...getHeaders(),
			Referer: `https://search.smzdm.com/?c=home&s=${encodeURIComponent(keyword)}&order=time&v=a`
		},
		searchParams: {
			c: "home",
			s: keyword,
			order: "time",
			v: "a",
			mx_v: "a"
		}
	})).data;
	const $ = load(data);
	const list = $(".feed-row-wide");
	return {
		title: `${keyword} - 什么值得买`,
		link: `https://search.smzdm.com/?c=home&s=${encodeURIComponent(keyword)}&order=time`,
		item: list && list.toArray().map((item) => {
			item = $(item);
			return {
				title: `${item.find(".feed-block-title a").eq(0).text().trim()} - ${item.find(".feed-block-title a").eq(1).text().trim()}`,
				description: `${item.find(".feed-block-descripe").contents().eq(2).text().trim()}<br>${item.find(".feed-block-extras span").text().trim()}<br><img src="http:${item.find(".z-feed-img img").attr("src")}">`,
				pubDate: timezone(parseDate(item.find(".feed-block-extras").contents().eq(0).text().trim(), ["MM-DD HH:mm", "HH:mm"]), 8),
				link: item.find(".feed-block-title a").attr("href")
			};
		})
	};
}
//#endregion
export { route };
