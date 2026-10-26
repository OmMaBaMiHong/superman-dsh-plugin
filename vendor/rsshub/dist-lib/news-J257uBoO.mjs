import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/samrdprc/news.ts
const route = {
	path: "/news/:type1/:type2",
	categories: ["government"],
	example: "/samrdprc/news/xfpzh/xfpgnzh",
	parameters: {
		type1: "召回类型ID1，见下表",
		type2: "召回类型ID2，见下表"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	description: `| 类型中文   | 召回类型 ID1 | 召回类型 ID2 |
| ---------- | ------------ | ------------ |
| 消费品召回 | xfpzh        | xfpgnzh      |
| 汽车召回   | qczh         | gnzhqc       |`,
	name: "召回信息",
	maintainers: ["a180285"],
	radar: [{
		source: ["www.samrdprc.org.cn/:type1/:type2"],
		target: "/news/:type1/:type2"
	}],
	handler: async (ctx) => {
		const url = `https://www.samrdprc.org.cn/${ctx.req.param("type1")}/${ctx.req.param("type2")}`;
		const $ = load((await got_default(url)).body);
		const typeName = $("div.box_main > div.boxl.fl > div.boxl_tit > div > span.fl").text();
		const listSelector = $("div.main > div.box1 > div.box_main > div.boxl.fl > div.boxl_ul > ul > li");
		const items = await Promise.all(listSelector.toArray().map((el) => {
			const item = $(el);
			const title = item.find("a").text();
			const link = url + "/" + item.find("a").attr("href");
			const pubDate = parseDate(item.find("span").text().trim());
			return cache_default.tryGet(link, async () => {
				const articleHTML = load((await got_default(link)).body)("div.main > div.box1 > div.box_main > div.boxl.fl > div.show_txt > div.TRS_Editor > div").html() || "";
				return {
					title,
					link,
					pubDate,
					description: articleHTML
				};
			});
		}));
		return {
			title: `${typeName} - 国家市场监督管理总局`,
			link: url,
			item: items
		};
	}
};
//#endregion
export { route };
