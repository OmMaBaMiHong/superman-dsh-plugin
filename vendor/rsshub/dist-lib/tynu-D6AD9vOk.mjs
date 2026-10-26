import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/tynu/tynu.ts
const baseUrl = "http://www.tynu.edu.cn";
const route = {
	path: "/",
	radar: [{
		source: [
			"tynu.edu.cn/index/tzgg.htm",
			"tynu.edu.cn/index.htm",
			"tynu.edu.cn/"
		],
		target: ""
	}],
	name: "Unknown",
	maintainers: ["2PoL"],
	handler,
	url: "tynu.edu.cn/index/tzgg.htm"
};
async function handler() {
	const link = `${baseUrl}/index/tzgg.htm`;
	const data = (await got_default(link)).data;
	const $ = load(data);
	const list = $(".news_content_list").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find("h3").text(),
			link: new URL(item.find($("a")).attr("href"), baseUrl).href,
			pubDate: parseDate(item.find(".content_list_time").text(), "YYYYMM-DD")
		};
	});
	await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const $ = load((await got_default(item.link)).data);
		item.description = $("#vsb_content").html() + ($(".content ul").not(".btm-cate").html() || "");
		return item;
	})));
	return {
		title: "太原师范学院通知公告",
		link,
		item: list
	};
}
//#endregion
export { route };
