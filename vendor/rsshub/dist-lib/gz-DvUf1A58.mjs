import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/gov/gz/index.ts
const rootUrl = "https://www.gz.gov.cn";
const urlMap = {
	gzyw: "gzyw",
	jrtt: "jrtt",
	tzgg: "tzgg",
	zcjd: "zcjd/zcjd"
};
async function handler(ctx) {
	const channel = ctx.req.param("channel") ?? ctx.req.path.split("/", 4)[3];
	const category = ctx.req.param("category");
	const url = `${rootUrl}/${channel}/${urlMap[category]}/`;
	const $ = load((await got_default(url)).data);
	const items = $(".news_list li").toArray().map((item) => {
		item = $(item);
		const href = item.find("a").attr("href");
		return {
			title: item.find("a").attr("title"),
			link: href,
			pubDate: parseDate(item.find("span").text())
		};
	});
	return {
		title: `广州市人民政府 - ${$(".main_title").text()}`,
		link: url,
		item: items
	};
}
//#endregion
export { handler as t };
