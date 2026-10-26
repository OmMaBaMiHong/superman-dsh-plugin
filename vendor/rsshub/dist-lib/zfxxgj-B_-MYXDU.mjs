import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { load } from "cheerio";
//#region lib/routes/gov/shenzhen/xxgk/zfxxgj.ts
const rootUrl = "http://www.sz.gov.cn/cn/xxgk/zfxxgj/";
const config = {
	tzgg: {
		link: "tzgg/",
		title: "通知公告"
	},
	zjxx: {
		link: "zjxx/szfczyjs/",
		title: "资金信息"
	},
	zfcg: {
		link: "zfcg/zfcgml",
		title: "政府采购"
	},
	zdxm: {
		link: "zdxm",
		title: "重大项目"
	}
};
const route = {
	path: "/xxgk/zfxxgj/:caty",
	categories: ["government"],
	example: "/gov/shenzhen/xxgk/zfxxgj/tzgg",
	parameters: { caty: "信息类别" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "政府信息公开",
	maintainers: ["laoxua"],
	handler,
	description: `| 通知公告 | 政府采购 | 资金信息 | 重大项目 |
| :------: | :------: | :------: | :------: |
|   tzgg   |   zfcg   |   zjxx   |   zdxm   |`
};
async function handler(ctx) {
	const cfg = config[ctx.req.param("caty")];
	if (!cfg) throw new InvalidParameterError("Bad category. See <a href=\"https://docs.rsshub.app/routes/government#guang-dong-sheng-ren-min-zheng-fu-guang-dong-sheng-shen-zhen-shi-ren-min-zheng-fu\">docs</a>");
	const currentUrl = new URL(cfg.link, rootUrl).href;
	const $ = load((await got_default(currentUrl)).data);
	const list = $("div.zx_ml_list ul li span.tit").toArray().map((item) => {
		item = $(item).find("a");
		return {
			title: item.text(),
			link: item.attr("href")
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default(item.link)).data);
		item.description = content("div.news_cont_d_wrap").html();
		if (content("div.fjdown").html() !== null) item.description += content("div.fjdown").html();
		item.pubDate = timezone(parseDate(content(".tit span:nth-child(2)").text().replace(/信息提供日期：/, "")), 8);
		return item;
	})));
	return {
		title: "广东省深圳市人民政府 - " + cfg.title,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
