import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/swjtu/gsee/yjs.ts
const rootURL = "https://gsee.swjtu.edu.cn";
const urlAddr = `${rootURL}/xwzx/tzgg.htm`;
const getItem = (item) => {
	const newsInfo = item.find("dt");
	const newsDate = item.find("dd").text().match(/\d{4}(.)\d{1,2}\1\d{1,2}/)[0];
	const infoTitle = newsInfo.text();
	const link = rootURL + newsInfo.find("a").last().attr("href").slice(2);
	return cache_default.tryGet(link, async () => {
		const infoText = load(await rofetch(link))(".article").html();
		return {
			title: infoTitle,
			pubDate: parseDate(newsDate),
			link,
			description: infoText
		};
	});
};
const route = {
	path: "/gsee/yjs",
	categories: ["university"],
	example: "/swjtu/gsee/yjs",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["gsee.swjtu.edu.cn/"] }],
	name: "地球科学与工程学院",
	maintainers: ["E1nzbern"],
	handler,
	description: "研究生教育通知公告"
};
async function handler() {
	const $ = load(await rofetch(urlAddr));
	const list = $("dl");
	const items = await Promise.all(list.toArray().map((i) => {
		const item = $(i);
		return getItem(item);
	}));
	return {
		title: "西南交大地学学院-研究生通知",
		link: urlAddr,
		item: items,
		allowEmpty: true
	};
}
//#endregion
export { route };
