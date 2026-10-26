import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/tingshuitz/nanjing.ts
const HOME_PAGE = "http://www.jlwater.com/";
const route = {
	path: "/nanjing",
	categories: ["forecast"],
	example: "/tingshuitz/nanjing",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["jlwater.com/portal/10000015", "jlwater.com/"] }],
	name: "南京市",
	maintainers: ["ocleo1", "pseudoyu"],
	handler,
	url: "jlwater.com/portal/10000015"
};
async function handler() {
	const url = `${HOME_PAGE}portal/10000015`;
	const data = (await got_default(url)).data;
	const $ = load(data);
	const list = $(".list-content ul li");
	return {
		title: $("head title").text(),
		link: url,
		item: list.toArray().map((item) => {
			const $item = $(item);
			const title = $item.find("a span").text();
			const link = $item.find("a").attr("href");
			const listTime = $item.find(".list-time").text();
			const pubDate = parseDate(listTime);
			return {
				title: `${title} ${listTime}`,
				description: "南京市停水通知",
				link: `${HOME_PAGE}${link}`,
				pubDate
			};
		})
	};
}
//#endregion
export { route };
