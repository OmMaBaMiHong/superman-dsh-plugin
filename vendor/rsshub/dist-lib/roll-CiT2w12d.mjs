import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/caijing/roll.ts
const route = {
	path: "/roll",
	categories: ["finance"],
	example: "/caijing/roll",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["roll.caijing.com.cn/index1.html", "roll.caijing.com.cn/"] }],
	name: "滚动新闻",
	maintainers: ["TonyRL"],
	handler,
	url: "roll.caijing.com.cn/index1.html"
};
async function handler() {
	const response = await got_default(`https://roll.caijing.com.cn/ajax_lists.php`, { searchParams: {
		modelid: 0,
		time: Math.random()
	} });
	const list = response.data.map((item) => ({
		title: item.title,
		link: item.url.replace("http://", "https://"),
		pubDate: timezone(parseDate(item.published, "MM-DD HH:mm"), 8),
		category: item.cat
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const $ = load((await got_default(item.link)).data);
		item.author = $(".editor").text().trim() || $("#editor_baidu").text().trim().replaceAll(/[()]/g, "");
		item.description = $(".article-content").html();
		item.category = [item.category, ...$(".news_keywords span").toArray().map((e) => $(e).text())];
		return item;
	})));
	return {
		title: "滚动新闻-财经网",
		image: "https://www.caijing.com.cn/favicon.ico",
		link: response.url,
		item: items
	};
}
//#endregion
export { route };
