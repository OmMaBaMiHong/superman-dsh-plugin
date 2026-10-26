import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import { load } from "cheerio";
//#region lib/routes/cctv/xwlb.ts
dayjs.extend(customParseFormat);
const route = {
	path: "/:site/:category/:name",
	categories: ["traditional-media"],
	example: "/cctv/tv/lm/xwlb",
	parameters: {
		site: "站点, 可选值如'tv', 既'央视节目'",
		category: "分类名, 官网对应分类, 当前可选值'lm', 既'栏目大全'",
		name: {
			description: "栏目名称, 可在对应栏目页面 URL 中找到, 可选值如'xwlb',既'新闻联播'",
			options: [{
				value: "xwlb",
				label: "新闻联播"
			}]
		}
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["tv.cctv.com/lm/xwlb", "tv.cctv.com/"] }],
	name: "新闻联播",
	maintainers: ["zengxs"],
	handler,
	url: "tv.cctv.com/lm/xwlb",
	description: "新闻联播内容摘要。"
};
async function handler(ctx) {
	const { site, category, name } = ctx.req.param();
	let responseData;
	if (site === "tv" && category === "lm" && name === "xwlb") responseData = await getXWLB();
	return responseData;
}
const getXWLB = async () => {
	const latestDate = dayjs(load((await got_default({
		method: "get",
		url: "https://tv.cctv.com/lm/xwlb/"
	})).data)(".rilititle p").text(), "YYYY-MM-DD");
	const count = [];
	for (let i = 0; i < 20; i++) count.push(i);
	return {
		title: "CCTV 新闻联播",
		link: "http://tv.cctv.com/lm/xwlb/",
		item: await Promise.all(count.map(async (i) => {
			const newsDate = latestDate.subtract(i, "days").hour(19);
			const url = `https://tv.cctv.com/lm/xwlb/day/${newsDate.format("YYYYMMDD")}.shtml`;
			return {
				title: `新闻联播 ${newsDate.format("YYYY/MM/DD")}`,
				link: url,
				pubDate: timezone(parseDate(newsDate.format()), 8),
				description: await cache_default.tryGet(url, async () => {
					const content = load((await got_default(url)).data);
					return content("body li").toArray().map((elem) => {
						const e = content(elem);
						return `<a href="${e.find("a").attr("href")}">${e.find("a").attr("title")} ⏱${e.find("span").text()}</a>`;
					}).join("<br/>\n");
				})
			};
		}))
	};
};
//#endregion
export { route as n, getXWLB as t };
