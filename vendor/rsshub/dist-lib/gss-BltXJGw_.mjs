import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/gov/mof/gss.ts
const DOMAIN = "gss.mof.gov.cn";
const handler = async (ctx) => {
	const { category = "zhengcefabu" } = ctx.req.param();
	const currentUrl = `https://${DOMAIN}/gzdt/${category}/`;
	const { data: response } = await got_default(currentUrl);
	const $ = load(response);
	const title = $("title").text();
	const author = $("div.zzName").text();
	const siteName = $("meta[name=\"SiteName\"]").prop("content");
	const description = $("meta[name=\"ColumnDescription\"]").prop("content");
	const indexes = $("ul.liBox li").toArray().map((li) => {
		const a = $(li).find("a");
		const pubDate = $(li).find("span").text();
		const href = a.prop("href");
		const link = href.startsWith("http") ? href : new URL(href, currentUrl).href;
		return {
			title: a.prop("title"),
			link,
			pubDate: timezone(parseDate(pubDate), 8)
		};
	});
	return {
		item: await Promise.all(indexes.map((item) => cache_default.tryGet(item.link, async () => {
			const { data: detailResponse } = await got_default(item.link);
			item.description = load(detailResponse)("div.my_doccontent").html() ?? "";
			item.author = author;
			return item;
		}))),
		title,
		link: currentUrl,
		description: `${description} - ${siteName}`,
		author
	};
};
const route = {
	path: "/gss/:category?",
	categories: ["government"],
	example: "/gov/mof/gss",
	parameters: { category: "列表标签，默认为政策发布" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "关税政策文件",
	maintainers: ["la3rence"],
	handler,
	description: `#### 关税文件发布

| 政策发布    | 政策解读     |
| ----------- | ------------ |
| zhengcefabu | zhengcejiedu |`,
	radar: [{
		source: ["gss.mof.gov.cn/gzdt/:category/"],
		target: "/gss/:category"
	}]
};
//#endregion
export { route };
