import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/tingshuitz/yangjiang.ts
const route = {
	path: "/yangjiang",
	categories: ["forecast"],
	example: "/tingshuitz/yangjiang",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["yjsswjt.com/zxdt_list.jsp", "yjsswjt.com/"] }],
	name: "阳江市",
	maintainers: ["ciaranchen"],
	handler,
	url: "yjsswjt.com/zxdt_list.jsp"
};
async function handler() {
	const $ = load((await got_default("https://www.yjsswjt.com/zxdt_list.jsp?flbz=7")).data);
	return {
		title: "停水通知 - 阳江市水务集团有限公司",
		link: "https://www.yjsswjt.com/zxdt_list.jsp?flbz=7",
		item: $("div.list_ul_div > ul > li").toArray().map((el) => {
			const item = $(el);
			const id = item.find("a").attr("href").slice(17, -1);
			return {
				title: item.find("span").text().trim(),
				description: item.find("span").text().trim(),
				link: "http://www.yjsswjt.com/list.jsp?id=" + id,
				pubDate: parseDate(item.find(".datetime").text(), "YYYY.MM.DD")
			};
		})
	};
}
//#endregion
export { route };
