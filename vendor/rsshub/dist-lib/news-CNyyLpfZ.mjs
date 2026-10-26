import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/guangzhoumetro/news.ts
const route = {
	path: "/news",
	categories: ["travel"],
	example: "/guangzhoumetro/news",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "新闻",
	maintainers: ["HankChow"],
	handler
};
async function handler() {
	const newsUrl = "https://www.gzmtr.com/ygwm/xwzx/gsxw/";
	const data = (await got_default(newsUrl)).data;
	const $ = load(data);
	return {
		title: "广州地铁新闻",
		url: newsUrl,
		description: "广州地铁新闻",
		item: $("ul.ag_h_w li").toArray().map((item) => {
			item = $(item);
			const url = newsUrl + item.find("a").attr("href").slice(2);
			return {
				title: item.find("a").text(),
				link: url,
				author: "广州地铁",
				pubtime: parseDate(item.find("span").text())
			};
		}).map((item) => ({
			title: item.title,
			pubDate: item.pubtime,
			link: item.link,
			author: item.author
		}))
	};
}
//#endregion
export { route };
