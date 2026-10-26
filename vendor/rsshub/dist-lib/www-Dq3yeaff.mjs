import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/zjut/www/index.ts
const rootUrl = "https://www.zjut.edu.cn/";
const host = "www.zjut.edu.cn";
const route = {
	path: "/www/:type",
	categories: ["university"],
	example: "/zjut/www/4528",
	parameters: { type: "分类，见下表" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "浙江工业大学首页",
	maintainers: ["zhullyb"],
	url: "www.zjut.edu.cn",
	handler,
	radar: [{
		source: ["www.zjut.edu.cn/:type/list.htm"],
		target: "/www/:type"
	}],
	description: `| 板块       | 参数       |
| ---------- | ---------- |
| 学术动态   | xsdt\\_4662 |
| 三创・人物 | 4527       |
| 通知公告   | 4528       |
| 美誉工大   | 5389       |
| 智库工大   | 5390       |
| 工大校历   | 4520       |
| 校区班车   | xqbc       |`
};
async function handler(ctx) {
	const type = ctx.req.param("type");
	const $ = load(await rofetch(rootUrl + type + "/list.htm"));
	const list = $("li.news.clearfix").toArray().map((item) => {
		const cheerioItem = $(item);
		const a = cheerioItem.find("a");
		try {
			const title = a.text() || "";
			let link = a.attr("href");
			if (!link) link = "";
			else if (!link.startsWith("http")) link = rootUrl.slice(0, -1) + link;
			const dateText = cheerioItem.find(".news_meta").text();
			if (!dateText) return {
				title: "",
				link: "",
				pubDate: Date.now()
			};
			const pubDate = timezone(parseDate(dateText), 8);
			return {
				title,
				link,
				pubDate
			};
		} catch {
			return {
				title: "",
				link: "",
				pubDate: Date.now()
			};
		}
	}).filter((item) => item.title && item.link);
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const newItem = {
			...item,
			description: ""
		};
		if (host === new URL(item.link).hostname) if (new URL(item.link).pathname.startsWith("/upload")) newItem.description = item.link;
		else newItem.description = load(await rofetch(item.link))("div.wp_articlecontent").html() || "";
		else newItem.description = item.link;
		return newItem;
	})));
	return {
		title: $("head > title").text() + " - 浙江工业大学",
		link: rootUrl + type,
		item: items
	};
}
//#endregion
export { route };
