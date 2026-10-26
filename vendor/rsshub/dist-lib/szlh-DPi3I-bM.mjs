import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { load } from "cheerio";
//#region lib/routes/gov/shenzhen/szlh/index.ts
const config = { tzgg: {
	link: "tzgg/",
	title: "通知公告"
} };
const route = {
	path: "/szlh/zwfw/zffw/:caty",
	categories: ["government"],
	example: "/gov/shenzhen/szlh/zwfw/zffw/tzgg",
	parameters: { caty: "信息类别" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["szlh.gov.cn/zwfw/zffw/:caty"] }],
	name: "罗湖区人民政府 政务服务",
	maintainers: ["lonn"],
	handler,
	description: `| 通知公告 |
| :------: |
|   tzgg   |`
};
async function handler(ctx) {
	const baseUrl = "http://www.szlh.gov.cn/zwfw/zffw/";
	const cfg = config[ctx.req.param("caty")];
	if (!cfg) throw new InvalidParameterError("Bad category. See <a href=\"https://docs.rsshub.app/routes/government#深圳市罗湖区人民政府\">docs</a>");
	const currentUrl = new URL(cfg.link, baseUrl).href;
	const $ = load(await rofetch(currentUrl));
	const items = $("div.lists ul li").toArray().map((item) => {
		item = $(item);
		const a = item.find("a").first();
		const date = a.find("i").text().trim();
		return {
			title: a.clone().find("i").remove().end().text().trim(),
			link: a.attr("href"),
			pubDate: timezone(parseDate(date, "YYYY-MM-DD"), 0)
		};
	});
	return {
		title: "深圳市罗湖区人民政府 - " + cfg.title,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
