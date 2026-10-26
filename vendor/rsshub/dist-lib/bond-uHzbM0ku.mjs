import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/gov/mof/bond.ts
const domain = "gks.mof.gov.cn";
const theme = "guozaiguanli";
const route = {
	path: "/bond/:category?",
	categories: ["government"],
	example: "/gov/mof/bond",
	parameters: { category: "专题，见下表，默认为国债管理工作动态" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "专题",
	maintainers: ["la3rence"],
	handler,
	description: `#### 政府债券管理

| 国债管理工作动态 | 记账式国债 (含特别国债) 发行 | 储蓄国债发行 | 地方政府债券管理      |
| ---------------- | ---------------------------- | ------------ | --------------------- |
| gzfxgzdt         | gzfxzjs                      | gzfxdzs      | difangzhengfuzhaiquan |`
};
async function handler(ctx) {
	const { category = "gzfxgzdt" } = ctx.req.param();
	const currentUrl = `https://${domain}/ztztz/${theme}/${category}/`;
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
			item.description = load(detailResponse)("div.my_doccontent").html();
			item.author = author;
			return item;
		}))),
		title,
		link: currentUrl,
		description: `${description} - ${siteName}`,
		author
	};
}
//#endregion
export { route };
