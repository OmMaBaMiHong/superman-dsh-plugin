import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/gov/moj/lfyjzj.ts
const DOMAIN = "www.moj.gov.cn";
const route = {
	path: "/lfyjzj",
	categories: ["government"],
	example: "/gov/moj/lfyjzj",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.moj.gov.cn/lfyjzj/lflfyjzj/*", "www.moj.gov.cn/pub/sfbgw/lfyjzj/lflfyjzj/*"] }],
	name: "立法意见征集",
	maintainers: ["la3rence"],
	handler,
	url: "www.moj.gov.cn/lfyjzj/lflfyjzj/*"
};
async function handler() {
	const rootUrl = `https://${DOMAIN}`;
	const currentUrl = `${rootUrl}/lfyjzj/lflfyjzj/index.html`;
	const { data: response } = await got_default(currentUrl);
	const $ = load(response);
	const siteName = $("title:first").text();
	const theme = $("div.list_title").text();
	const description = `${siteName} - ${theme}`;
	const icon = new URL("/images/sfbgw_favicon.ico", rootUrl).href;
	const indexes = $("ul.newsMsgList_zzy li").toArray().map((li) => {
		const a = $(li).find("a");
		const pubDate = $(li).find("div.rightData").text();
		const href = a.prop("href");
		const link = href.startsWith("http") ? href : new URL(href, currentUrl).href;
		return {
			title: a.text(),
			link,
			pubDate: timezone(parseDate(pubDate), 8)
		};
	});
	return {
		item: await Promise.all(indexes.map((item) => cache_default.tryGet(`gov:mof:${item.link}`, async () => {
			const { data: detailResponse } = await got_default(item.link);
			const content = load(detailResponse);
			item.description = content("div.TRS_Editor").html();
			item.author = content("div.sT_left span:first").text().split("：", 2)[1];
			const pubDate = content("div.sT_left span:last").text().split("：", 2)[1];
			item.pubDate = pubDate ? timezone(parseDate(pubDate), 8) : item.pubDate;
			return item;
		}))),
		title: theme,
		link: currentUrl,
		description,
		author: siteName,
		icon
	};
}
//#endregion
export { route };
