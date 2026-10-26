import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/szftedu/gonggao.ts
const host = "https://ylxx.szftedu.cn/xx_5828/xygg_5832/";
const route = {
	path: "/gonggao",
	categories: ["university"],
	example: "/szftedu/gonggao",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "公告",
	maintainers: ["valuex"],
	handler,
	description: ""
};
async function handler() {
	const $ = load((await got_default(host)).data);
	const lists = $("div.pagenews04 div ul li").toArray().map((el) => ({
		title: $("a", el).text().trim(),
		link: $("a", el).attr("href"),
		pubDate: timezone(parseDate($("span[class=canedit]", el).text()), 8)
	}));
	const items = await Promise.all(lists.map((item) => cache_default.tryGet(item.link, async () => {
		const thisUrl = item.link;
		const $ = load((await got_default(thisUrl.includes("http") ? thisUrl : host + thisUrl.slice(1))).data);
		item.description = thisUrl.includes("http") ? $("#page-content").html() : $("div.TRS_Editor").html();
		item.pubDate = timezone(parseDate($(".item").first().text().replace("发布时间：", "")), 8);
		return item;
	})));
	return {
		title: "园岭小学公告",
		link: host,
		description: "园岭小学公告",
		item: items
	};
}
//#endregion
export { route };
