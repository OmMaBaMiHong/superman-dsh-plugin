import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
import iconv from "iconv-lite";
//#region lib/routes/iqnew/latest.ts
const route = {
	path: "/latest",
	categories: ["other"],
	example: "/iqnew/latest",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["iqnew.com/post/new_100/", "iqnew.com/"] }],
	name: "最近更新",
	maintainers: ["nczitzk"],
	handler,
	url: "iqnew.com/post/new_100/"
};
async function handler(ctx) {
	const rootUrl = "https://www.iqnew.com";
	const url = "https://www.iqnew.com/post/new_100/";
	const response = await got_default({
		method: "get",
		url,
		responseType: "buffer"
	});
	const $ = load(iconv.decode(response.data, "gb2312"));
	const list = $(".page-main-list .list-item a").slice(0, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 50).toArray().map((item) => {
		item = $(item);
		return { link: rootUrl + item.attr("href") };
	});
	return {
		title: "爱Q生活网 - 最近更新",
		link: url,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const detailResponse = await got_default({
				method: "get",
				url: item.link,
				responseType: "buffer"
			});
			const content = load(iconv.decode(detailResponse.data, "gb2312"));
			item.title = content(".main-article .title").text();
			item.pubDate = timezone(parseDate(content(".time").eq(0).text()), 8);
			item.description = content(".content-intro").html();
			item.author = content(".author a").text();
			item.category = content(".keyword > a").toArray().map((item) => $(item).text());
			return item;
		})))
	};
}
//#endregion
export { route };
