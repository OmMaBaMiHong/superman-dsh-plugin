import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/scu/scupi/_utils.ts
async function getNotifList() {
	try {
		const html = (await got_default.get("https://scupi.scu.edu.cn/activities/notice", { headers: { "User-Agent": config.ua } })).body;
		const $ = load(html);
		return $("body > div.wrapper > main > section > div > div > div.news > div > ul").find("article").toArray().map((articleElement) => {
			const titleElement = $(articleElement).find("li > div > div.news-text > h4 > a");
			const timeElement = $(articleElement).find("li > div > div.news-text > span");
			const imageElement = $(articleElement).find("li > div > div.news-img > a > img");
			const link = titleElement.attr("href");
			const title = titleElement.attr("title");
			const pubDate = timeElement.text().trim();
			return {
				title,
				link,
				itunes_item_image: imageElement.attr("src"),
				pubDate: parseDate(pubDate, "YYYY-MM-DD")
			};
		});
	} catch {}
	return [];
}
async function getArticle(item) {
	try {
		const html = (await got_default.get(item.link, { headers: { "User-Agent": config.ua } })).body;
		item.description = load(html)("body > div > main > section > div > div > div.post-content-contaier > div").html();
		return item;
	} catch {}
	return item;
}
//#endregion
//#region lib/routes/scu/scupi/notice.ts
const route = {
	path: "/scupi",
	categories: ["university"],
	example: "/scu/scupi",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "匹兹堡学院通知",
	maintainers: ["sitdownkevin"],
	url: "scupi.scu.edu.cn/activities/notice",
	handler,
	description: ""
};
async function handler() {
	const items = await getNotifList();
	return {
		title: "四川大学匹兹堡学院",
		description: "四川大学匹兹堡学院官网通知",
		language: "zh-cn",
		image: "https://upload.wikimedia.org/wikipedia/zh/4/45/Sichuan_University_logo.svg",
		logo: "https://upload.wikimedia.org/wikipedia/zh/4/45/Sichuan_University_logo.svg",
		link: "https://scupi.scu.edu.cn/",
		item: await Promise.all(items.map((item) => cache_default.tryGet(item.link, () => getArticle(item))))
	};
}
//#endregion
export { route };
