import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/wkjyqh/research.ts
const route = {
	path: "/research",
	categories: ["finance"],
	example: "/wkjyqh/research",
	radar: [{ source: ["www.wkjyqh.com/main/research_center/yjbg/index.shtml", "www.wkjyqh.com/main/research_center/"] }],
	name: "研究报告",
	maintainers: ["TonyRL"],
	handler,
	url: "www.wkjyqh.com/main/research_center/yjbg/index.shtml"
};
async function handler() {
	const baseUrl = "https://www.wkjyqh.com";
	const link = `${baseUrl}/main/research_center/yjbg/index.shtml`;
	const list = (await rofetch(`${baseUrl}/servlet/json`, {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams({
			funcNo: "2000153",
			catalogId: "232",
			pageNow: "1",
			pageSize: "15",
			isFilter: "1",
			titleLength: "35",
			briefLength: "70",
			_catalogId: "",
			rightId: ""
		}),
		responseType: "json"
	})).results[0].data.map((item) => ({
		title: item.title,
		link: new URL(item.url, baseUrl).href,
		pubDate: timezone(parseDate(item.publish_date), 8)
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load(await rofetch(item.link))(".article_detail");
		item.pubDate = timezone(parseDate(content.find("b#time").text()), 8);
		content.find("h2, .tips").remove();
		item.description = content.html()?.trim();
		return item;
	})));
	return {
		title: "五矿期货 - 研究报告",
		link,
		language: "zh-CN",
		image: `${baseUrl}/favicon.ico`,
		item: items
	};
}
//#endregion
export { route };
