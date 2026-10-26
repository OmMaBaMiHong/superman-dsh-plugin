import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as getFullText } from "./utils-BOvP2_rk.mjs";
import { load } from "cheerio";
//#region lib/routes/cna/web/index.ts
const route = {
	path: "/web/:id?",
	categories: ["traditional-media"],
	example: "/cna/web/aall",
	parameters: { id: "分类 id，见上表。此參數默认为 aall" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "分类 (网页爬虫方法)",
	maintainers: ["dzx-dzx"],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id") || "aall";
	const rootUrl = /^\d+$/.test(id) ? `https://www.cna.com.tw/topic/newstopic/${id}.aspx` : `https://www.cna.com.tw/list/${id}.aspx`;
	const $ = load((await got_default({
		method: "get",
		url: rootUrl
	})).data);
	const list = $("*:is(.pcBox .caItem, .mainList li a div) h2").slice(0, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 10).toArray().map((item) => {
		item = $(item);
		return {
			title: item.text(),
			link: new URL(item.parents("a").attr("href"), "https://www.cna.com.tw").href,
			pubDate: timezone(parseDate(item.next().text()), 8)
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => await getFullText(item))));
	return {
		title: $("title").text(),
		link: rootUrl,
		item: items
	};
}
//#endregion
export { route };
