import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
import pMap from "p-map";
//#region lib/routes/gov/nrta/dsj.ts
const route = {
	path: "/dsj/:category?",
	categories: ["government"],
	example: "/gov/nrta/dsj",
	parameters: { category: "分类，见下表，默认为备案公示" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "电视剧政务平台",
	maintainers: ["nczitzk"],
	handler,
	description: `| 备案公示 | 发行许可通告 | 重大题材立项     | 重大题材摄制    | 变更通报 |
| -------- | ------------ | ---------------- | --------------- | -------- |
| note     | announce     | importantLixiang | importantShezhi | changing |`
};
async function handler(ctx) {
	const { category = "note" } = ctx.req.param();
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 15;
	const rootUrl = "https://dsj.nrta.gov.cn";
	const currentUrl = new URL(`tims/site/views/applications.shanty?appName=${category}`, rootUrl).href;
	const { data: response } = await got_default(currentUrl);
	const $ = load(response);
	return {
		item: await pMap($("img[src=\"/site/styles/default/images/icon_arrow_r.gif\"]").slice(0, limit).toArray().map((item) => {
			item = $(item).next();
			const pubDateMatches = item.text().match(/(\d+年\d+月)/);
			return {
				title: item.text(),
				link: new URL(item.prop("href"), rootUrl).href,
				pubDate: pubDateMatches ? parseDate(pubDateMatches[1], ["YYYY年MM月", "YYYY年M月"]) : void 0
			};
		}), (item) => cache_default.tryGet(item.link, async () => {
			const { data: detailResponse } = await got_default(item.link);
			const content = load(detailResponse);
			content("table").last().remove();
			item.description = content("td.newstext").html() || content("table").last().parent().parent().html();
			return item;
		}), { concurrency: 5 }),
		title: `${$("title").text()}-${$("div.headbottom_menu_selected").text()}`,
		link: currentUrl,
		description: $("td").last().text(),
		language: "zh-cn",
		image: $("img").first().prop("src"),
		author: "国家广播电影电视总局电视剧管理司"
	};
}
//#endregion
export { route };
