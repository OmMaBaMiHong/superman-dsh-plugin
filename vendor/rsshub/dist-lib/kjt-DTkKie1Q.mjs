import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/gov/shaanxi/kjt.ts
const route = {
	path: "/kjt/:id?",
	categories: ["government"],
	example: "/gov/shaanxi/kjt",
	parameters: { id: "分类，见下表，默认为通知公告" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "省科学技术厅",
	maintainers: ["nczitzk"],
	handler,
	description: `| 科技头条 | 工作动态 | 基层科技 | 科技博览 | 媒体聚焦 | 通知公告 |
| -------- | -------- | -------- | -------- | -------- | -------- |
| 1061     | 24       | 27       | 25       | 28       | 221      |`
};
async function handler(ctx) {
	const id = ctx.req.param("id") ?? "221";
	const rootUrl = "https://kjt.shaanxi.gov.cn";
	const currentUrl = `${rootUrl}/view/iList.jsp?cat_id=${id}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	let items = $(".textlist li a").toArray().map((item) => {
		item = $(item);
		return {
			title: item.text(),
			link: `${rootUrl}${item.attr("href")}`,
			pubDate: parseDate(item.prev().text())
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		item.description = content(".info_content").html();
		item.author = content("meta[name=\"Author\"]").attr("content");
		item.pubDate = timezone(parseDate(content("meta[name=\"PubDate\"]").attr("content")), 8);
		return item;
	})));
	return {
		title: `陕西省科学技术厅 - ${$(".catnm").text()}`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
