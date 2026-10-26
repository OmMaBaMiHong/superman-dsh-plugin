import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/sustech/newshub-zh.ts
const route = {
	path: "/newshub-zh",
	categories: ["university"],
	example: "/sustech/newshub-zh",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["newshub.sustech.edu.cn/news"] }],
	name: "新闻网（中文）",
	maintainers: ["sparkcyf"],
	handler,
	url: "newshub.sustech.edu.cn/news"
};
async function handler() {
	const baseUrl = "https://newshub.sustech.edu.cn";
	const link = `${baseUrl}/news`;
	const data = (await got_default({
		method: "get",
		url: link
	})).data;
	const $ = load(data);
	const list = $(".m-newslist ul li");
	return {
		title: "南方科技大学新闻网-中文",
		link,
		item: list && list.toArray().map((item) => {
			item = $(item);
			const itemPicUrl = item.find(".u-pic div").attr("style").match(/url\('(.+?)'\)/)[1];
			return {
				pubDate: parseDate(item.find(".mobi").text(), "YYYY-MM-DD"),
				title: item.find(".f-clamp").text(),
				description: `<img src="${baseUrl}${itemPicUrl}"><br>${item.find(".f-clamp4").text()}`,
				link: `${baseUrl}${item.find("a").attr("href")}`
			};
		})
	};
}
//#endregion
export { route };
