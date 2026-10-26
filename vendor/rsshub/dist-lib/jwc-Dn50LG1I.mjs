import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/xaut/jwc.ts
const route = {
	path: "/jwc/:category?",
	categories: ["university"],
	example: "/xaut/jwc/tzgg",
	parameters: { category: "通知类别，默认为通知公告" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "教务处",
	maintainers: ["mocusez"],
	handler,
	description: `::: warning
有些内容需使用校园网或 VPN 访问知行网获取
:::

| 通知公告 | 新闻动态 | 规章制度 | 竞赛结果公示 | 竞赛获奖通知 | 竞赛信息 | 公开公示 |
| :------: | :------: | :------: | :----------: | :----------: | :------: | :------: |
|   tzgg   |   xwdt   |   gzzd   |     jggs     |     jsjg     |   jsxx   |   gkgs   |`
};
async function handler(ctx) {
	let category = ctx.req.param("category");
	const rootUrl = "http://jwc.xaut.edu.cn/";
	const dic_html = {
		tzgg: "tzgg.htm",
		xwdt: "xwdt.htm",
		gzzd: "gzzd.htm",
		jggs: "xkjs/jggs.htm",
		jsjg: "xkjs/jsjg.htm",
		jsxx: "xkjs/jsxx.htm",
		gkgs: "gkgs.htm"
	};
	const dic_title = {
		tzgg: "通知公告",
		xwdt: "新闻动态",
		gzzd: "规章制度",
		jggs: "竞赛结果公示",
		jsjg: "竞赛获奖通知",
		jsxx: "竞赛信息",
		gkgs: "公开公示"
	};
	if (dic_title[category] === void 0) category = "tzgg";
	const data = (await got_default({
		method: "get",
		url: rootUrl + dic_html[category]
	})).body;
	const $ = load(data);
	const list = $(".main_conRCb a").slice(0, 20).toArray().map((item) => {
		item = $(item);
		const link = item.attr("href").replace(/^\.\./, () => rootUrl).replace(/^(info)/, () => "http://jwc.xaut.edu.cn/info");
		return {
			title: item.find("em").text(),
			link,
			pubDate: parseDate(item.find("span").text())
		};
	});
	return {
		title: "西安理工大学教务处-" + dic_title[category],
		link: rootUrl,
		description: "西安理工大学教务处-" + dic_title[category],
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			if (!item.link.match("zhixing.xaut.edu.cn") && !item.link.match("xinwen.xaut.edu.cn")) item.description = load((await got_default({
				method: "get",
				url: item.link
			})).body)("#vsb_content").html();
			else item.description = "请在校内或校园VPN内查看内容";
			return item;
		})))
	};
}
//#endregion
export { route };
