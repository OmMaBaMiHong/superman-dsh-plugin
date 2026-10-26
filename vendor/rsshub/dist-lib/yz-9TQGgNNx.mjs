import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/xjtu/yz.ts
const route = {
	path: "/yz/:category?",
	categories: ["university"],
	example: "/xjtu/yz/zsdt",
	parameters: { category: "栏目类型，默认请求`zsdt`，详见下方表格" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["yz.xjtu.edu.cn/index/:category.htm"],
		target: "/yz/:category"
	}],
	name: "研究生招生信息网",
	maintainers: ["YoghurtGuy"],
	handler,
	description: `栏目类型

| 招生动态 | 通知公告 | 政策法规 | 招生统计 | 历年复试线 | 博士招生 | 硕士招生 | 推免生 | 其他招生 |
| -------- | -------- | -------- | -------- | ---------- | -------- | -------- | ------ | -------- |
| zsdt     | tzgg     | zcfg     | zstj     | lnfsx      | bszs     | sszs     | tms    | qtzs     |`
};
async function handler(ctx) {
	const { category = "zsdt" } = ctx.req.param();
	const baseUrl = "https://yz.xjtu.edu.cn";
	const $ = load(await rofetch(`${baseUrl}/index/${category}.htm`));
	const list = $("div.list-con ul li").toArray().map((item_) => {
		const item = $(item_);
		const a = item.find("a");
		return {
			title: a.attr("title"),
			link: new URL(a.attr("href"), baseUrl).href,
			pubDate: timezone(parseDate(item.find("span.date.fr").text()), 8)
		};
	});
	return {
		title: "西安交通大学研究生招生信息网",
		link: "https://yz.xjtu.edu.cn",
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			try {
				const content = load(await rofetch(item.link));
				item.description = content("#vsb_content").html() + (content("form ul").length > 0 ? content("form ul").html() : "");
				return item;
			} catch (error) {
				logger.error(`Fetch failed for ${item.link}:`, error);
				return item;
			}
		})))
	};
}
//#endregion
export { route };
