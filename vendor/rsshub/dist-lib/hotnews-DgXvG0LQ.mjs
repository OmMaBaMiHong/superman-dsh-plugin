import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/chsi/hotnews.ts
const host = "https://yz.chsi.com.cn";
const route = {
	path: "/hotnews",
	categories: ["study"],
	example: "/chsi/hotnews",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["yz.chsi.com.cn/"] }],
	name: "考研热点新闻",
	maintainers: ["yanbot-team"],
	handler,
	url: "yz.chsi.com.cn/"
};
async function handler() {
	const list = load((await got_default(host)).data)(".focus-part .index-hot a");
	const items = await Promise.all(list.map((i, item) => {
		const { href: path, title: itemTitle } = item.attribs;
		let itemUrl = "";
		itemUrl = path.startsWith("http") ? path : host + path;
		return cache_default.tryGet(itemUrl, async () => {
			let description;
			let itemDate;
			if (path) {
				const $ = load((await got_default(itemUrl)).data);
				description = $("#article_dnull").html() ? $("#article_dnull").html().trim() : itemTitle;
				if ($(".news-time").text()) itemDate = $(".news-time").text();
			} else description = itemTitle;
			const result = {
				title: itemTitle,
				link: itemUrl,
				description
			};
			if (itemDate) result.pubDate = parseDate(itemDate, "YYYY年MM月DD日");
			return result;
		});
	}));
	return {
		title: "中国研究生招生信息网 - 热点",
		link: host,
		description: "中国研究生招生信息网 - 热点",
		item: items
	};
}
//#endregion
export { route };
