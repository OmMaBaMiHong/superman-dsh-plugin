import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/globallawreview/index.ts
const route = {
	path: "/",
	radar: [{
		source: ["globallawreview.org/Magazine/GetIssueContentList", "globallawreview.org/"],
		target: ""
	}],
	name: "Unknown",
	maintainers: ["nczitzk"],
	handler,
	url: "globallawreview.org/Magazine/GetIssueContentList"
};
async function handler(ctx) {
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 30;
	const rootUrl = "http://www.globallawreview.org";
	const { data: firstResponse } = await got_default(rootUrl);
	let $ = load(firstResponse);
	const currentUrl = new URL($("p.tabBtn span a").prop("href"), rootUrl).href;
	const { data: response } = await got_default(currentUrl);
	$ = load(response);
	return {
		item: $("ul.digest li").slice(0, limit).toArray().map((item) => {
			item = $(item);
			const a = item.find("p.p1 a");
			const link = new URL(a.prop("href"), rootUrl).href;
			return {
				title: a.text(),
				link,
				description: item.find("p.p2").html(),
				author: item.find("p.p3 span").text() || a.text().split("：", 1)[0],
				category: [item.find("p.p4").text().match(/\] (\d+\.\d+);/)[1]],
				enclosure_url: link,
				enclosure_length: item.find("p.p4").text().match(/(\d+(\.\d+)?)\sKB/)[1] * 1e3
			};
		}),
		title: $("title").text(),
		link: currentUrl,
		language: "zh-cn",
		author: "中国社会科学院法学研究所"
	};
}
//#endregion
export { route };
