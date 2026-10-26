import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { load } from "cheerio";
//#region lib/routes/gov/shenzhen/zjj/index.ts
const config = { tzgg: {
	link: "tzgg/",
	title: "通知公告"
} };
const route = {
	path: "/zjj/xxgk/:caty",
	categories: ["government"],
	example: "/gov/shenzhen/zjj/xxgk/tzgg",
	parameters: { caty: "信息类别" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["zjj.sz.gov.cn/xxgk/:caty"] }],
	name: "住房和建设局",
	maintainers: ["lonn"],
	handler,
	description: `| 通知公告 |
| :------: |
|   tzgg   |`
};
async function handler(ctx) {
	const baseUrl = "http://zjj.sz.gov.cn/xxgk/";
	const cfg = config[ctx.req.param("caty")];
	if (!cfg) throw new InvalidParameterError("Bad category. See <a href=\"https://docs.rsshub.app/routes/government#guang-dong-sheng-ren-min-zheng-fu-shen-zhen-shi-zhu-fang-he-jian-she-ju\">docs</a>");
	const currentUrl = new URL(cfg.link, baseUrl).href;
	const { data: response } = await got_default(currentUrl);
	const $ = load(response);
	const items = $("div.listcontent_right ul li").toArray().map((item) => {
		item = $(item);
		const a = item.find("a").first();
		return {
			title: a.text(),
			link: a.attr("href"),
			pubDate: timezone(parseDate(item.find("span").first().text(), "YY-MM-DD"), 0)
		};
	});
	return {
		title: "深圳市住房和建设局 - " + cfg.title,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
