import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/gov/sh/wsjkw/yqtb/index.ts
const route = {
	path: "/wsjkw/yqtb",
	categories: ["government"],
	example: "/gov/sh/wsjkw/yqtb",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["wsjkw.sh.gov.cn/"] }],
	name: "卫健委 疫情通报",
	maintainers: ["zcf0508"],
	handler,
	url: "wsjkw.sh.gov.cn/"
};
async function handler() {
	const url = "https://wsjkw.sh.gov.cn/yqtb/index.html";
	const $ = load((await got_default.get(url)).data);
	return {
		title: "疫情通报-上海卫健委",
		link: url,
		item: $(".uli16.nowrapli.list-date  li").toArray().map((item) => {
			item = $(item);
			const title = item.find("a").text();
			const address = item.find("a").attr("href");
			const host = "https://wsjkw.sh.gov.cn";
			return {
				title,
				description: title,
				pubDate: parseDate(item.find("span").text(), "YYYY-MM-DD"),
				link: host + address,
				guid: host + address
			};
		})
	};
}
//#endregion
export { route };
