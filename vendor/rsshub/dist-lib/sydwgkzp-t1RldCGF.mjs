import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/gov/chongqing/sydwgkzp.ts
const route = {
	path: "/sydwgkzp/:year?",
	url: "rlsbj.cq.gov.cn/",
	categories: ["government"],
	example: "/gov/chongqing/sydwgkzp",
	parameters: { year: "需要订阅的年份，格式为`YYYY`，必须小于等于当前年份，默认为当前年份" },
	radar: [{ source: ["rlsbj.cq.gov.cn/"] }],
	name: "人力社保局 - 事业单位公开招聘",
	maintainers: ["MajexH"],
	handler
};
async function handler(ctx) {
	const current = currentYear();
	const { year: tempYear } = ctx.req.param();
	const year = /^\d{4}$/.test(tempYear) ? +tempYear : current;
	let sydwgkzpUrl = `https://rlsbj.cq.gov.cn/zwxx_182/sydw/${year === current ? "" : `sydwgkzp${year}/`}`;
	const { data: response } = await got_default(sydwgkzpUrl);
	let $ = load(response);
	const metaRefresh = $("meta[http-equiv=\"Refresh\"]").attr("content");
	if (metaRefresh) {
		const redirectPath = metaRefresh.split("URL=", 2)[1];
		sydwgkzpUrl = new URL(redirectPath, sydwgkzpUrl).href;
		const { data: newResponse } = await got_default(sydwgkzpUrl);
		$ = load(newResponse);
	}
	const list = $("ul[class=\"rsj-list1\"] > li").toArray().map((item) => {
		item = $(item);
		const title = item.find("a").first();
		return {
			title: title.text(),
			link: new URL(title.attr("href"), sydwgkzpUrl).href,
			pubDate: parseDate(item.find("span").text())
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: response } = await got_default(item.link);
		item.description = load(response)(".trs_editor_view").first().html();
		return item;
	})));
	return {
		title: `重庆市事业单位${year}年公开招聘`,
		link: sydwgkzpUrl,
		item: items
	};
}
function currentYear() {
	return (/* @__PURE__ */ new Date()).getFullYear();
}
//#endregion
export { route };
