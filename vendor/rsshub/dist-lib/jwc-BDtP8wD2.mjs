import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/jlu/jwc.ts
const route = {
	path: "/jwc",
	categories: ["university"],
	example: "/jlu/jwc",
	radar: [{ source: ["jwc.jlu.edu.cn", "jwc.jlu.edu.cn/index.htm"] }],
	name: "教务通知",
	maintainers: ["mayouxi"],
	handler,
	url: "jwc.jlu.edu.cn"
};
async function handler() {
	const baseUrl = "https://jwc.jlu.edu.cn";
	const $ = load((await got_default(baseUrl)).body);
	return {
		title: "吉林大学教务处",
		link: baseUrl,
		description: "吉林大学教务处通知公告",
		item: $(".section2 .s2-r .s3-list ul li")?.toArray().map((item) => {
			const el = $(item);
			const linkEl = el.find("a");
			const YMStr = el.find(".tm p").text().trim();
			const DStr = el.find(".tm span").text().trim();
			return {
				title: el.find(".s3-info p").text().trim(),
				link: `${baseUrl}/${linkEl.attr("href")}`,
				pubDate: /* @__PURE__ */ new Date(YMStr + "-" + DStr)
			};
		})
	};
}
//#endregion
export { route };
