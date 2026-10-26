import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/pku/pkuyjs.ts
const route = {
	path: "/admission/sszs",
	categories: ["university"],
	example: "/pku/admission/sszs",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["admission.pku.edu.cn/zsxx/sszs/index.htm", "admission.pku.edu.cn/"] }],
	name: "研究生招生网",
	maintainers: ["pkuyjs"],
	handler,
	url: "admission.pku.edu.cn/zsxx/sszs/index.htm"
};
async function handler() {
	const link = "https://admission.pku.edu.cn/zsxx/sszs/index.htm";
	const $ = load((await got_default(link)).data);
	const list = $(".zsxx_cont_list li");
	return {
		title: `${$(".twostage_title_C").text()} - ${$("title").text()}`,
		link,
		description: "北京大学研究生院通知公告",
		item: list.toArray().map((item) => {
			item = $(item);
			return {
				title: item.find("li a").text(),
				description: item.find("li a").text(),
				link: item.find("li a").attr("href"),
				pubDate: parseDate(item.find(".zsxxCont_list_time").text())
			};
		})
	};
}
//#endregion
export { route };
