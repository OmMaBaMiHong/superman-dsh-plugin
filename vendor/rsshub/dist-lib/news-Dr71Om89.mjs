import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/wzu/news.ts
const baseUrl = "http://www.wzu.edu.cn/index/";
const newsType = {
	wdxw: "温大新闻",
	mtwd: "媒体温大",
	xswd: "学术温大",
	tzgg: "通知公告",
	zbxx: "招标信息",
	xsgg: "学术公告"
};
/**
* @description: 抓取文章内容
* @param {*} link
* @return {*} description
*/
async function loadContent(link) {
	let videoUrl = "";
	const $ = load((await got_default.get(link)).data, { decodeEntities: false });
	$("img").attr("src", (n, v) => new URL(v, baseUrl).href);
	$(".vsbcontent_video").each((_, el) => {
		const u1 = $(el).find("script").attr("vurl");
		videoUrl = new URL(u1, baseUrl).href;
		$(el).html("<video width=\"100%\" src=\"" + videoUrl + "\"></video>").html();
	});
	return $("div[id^=vsb_content]").html();
}
const route = {
	path: "/news/:type?",
	name: "Unknown",
	maintainers: ["Chandler-Lu"],
	handler
};
async function handler(ctx) {
	const routeTag = Number.parseInt(ctx.req.param("type")) || 0;
	const [k1, newsTitle] = Object.entries(newsType)[routeTag];
	const newsLink = new URL(k1 + ".htm", baseUrl).href;
	const list = load((await got_default.get(newsLink)).data)("#News-sidebar-b-nav").find("li");
	return {
		title: newsTitle,
		link: newsLink,
		description: `温州大学 - ${newsTitle}`,
		item: list.toArray().map(async (item) => {
			const $ = load(item);
			const $a1 = $("li>a");
			const $originUrl = $a1.attr("href");
			const $itemUrl = new URL($originUrl, baseUrl).href;
			return {
				title: $a1.attr("title"),
				description: await cache_default.tryGet($itemUrl, () => loadContent($itemUrl)),
				pubDate: parseDate($("li>samp").text(), "YYYY-MM-DD"),
				link: $itemUrl
			};
		})
	};
}
//#endregion
export { route };
