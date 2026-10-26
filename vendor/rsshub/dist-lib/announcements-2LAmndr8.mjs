import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/fzmtr/announcements.ts
const route = {
	path: "/announcements",
	categories: ["travel"],
	example: "/fzmtr/announcements",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "通知公告",
	maintainers: ["HankChow"],
	handler
};
async function handler() {
	const domain = "www.fzmtr.com";
	const announcementsUrl = `http://${domain}/html/fzdt/tzgg/index.html`;
	const data = (await got_default(announcementsUrl)).data;
	const $ = load(data);
	return {
		title: "福州地铁通知公告",
		url: announcementsUrl,
		description: "福州地铁通知公告",
		item: $("span#resources li").toArray().map((item) => {
			item = $(item);
			const url = `http://${domain}` + item.find("a").attr("href");
			return {
				title: item.find("a").text(),
				link: url,
				author: "福州地铁",
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
