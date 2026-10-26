import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/scut/scet/notice.ts
const route = {
	path: "/scet/notice",
	categories: ["university"],
	example: "/scut/scet/notice",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "土木与交通学院 - 学工通知",
	maintainers: ["railzy"],
	handler
};
async function handler() {
	const link = "https://www2.scut.edu.cn/jtxs/24241/list.htm";
	const data = (await got_default({
		method: "get",
		url: link
	})).data;
	const $ = load(data);
	const list = $("#wp_news_w5 li");
	return {
		title: "华南理工大学土木与交通学院 - 学工通知",
		link,
		item: list && list.toArray().map((item) => {
			item = $(item);
			return {
				title: item.find("li a").text(),
				description: item.find("li a").text(),
				link: item.find("li a").attr("href"),
				pubDate: item.find(".Article_PublishDate").text()
			};
		})
	};
}
//#endregion
export { route };
