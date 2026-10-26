import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/sjtu/seiee/index.ts
const route = {
	path: "/seiee/:path/:catID?/:searchCatCode?",
	categories: ["university"],
	example: "/sjtu/seiee/xzzx_notice_bks",
	parameters: {
		path: "不含'.html'的最后一部分路径",
		catID: "'本科生人才培养'与'研究生人才培养'的类别ID",
		searchCatCode: "'本科生人才培养'与'研究生人才培养'下类别名"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["www.seiee.sjtu.edu.cn/:path.html"],
		target: "/seiee/:path"
	}],
	name: "电子信息与电气工程学院",
	maintainers: ["dzx-dzx"],
	handler
};
async function handler(ctx) {
	const { path, catID = "", searchCatCode = "" } = ctx.req.param();
	const rootUrl = "https://www.seiee.sjtu.edu.cn";
	const currentUrl = `${rootUrl}/${path}.html`;
	const $ = load(catID ? (await rofetch(`${rootUrl}/active/ajax_article_list.html`, {
		method: "POST",
		body: new URLSearchParams({
			page: "1",
			cat_id: catID,
			search_cat_code: searchCatCode,
			search_cat_title: "",
			template: "v_ajax_normal_list1"
		}),
		headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
		parseResponse: JSON.parse
	})).content : await rofetch(currentUrl));
	const list = $(catID ? "li" : ".u10 li").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find(".name").text().trim(),
			link: item.find("a").attr("href")
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load(await rofetch(item.link));
		item.description = content(".nr").html();
		item.pubDate = timezone(parseDate(content(".jj").text().trim().match(/日期：([\d-]+) /)[1]), 8);
		return item;
	})));
	const fallbackHtml = await rofetch(currentUrl);
	return {
		title: $("title").text() || load(fallbackHtml)("title").text(),
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
