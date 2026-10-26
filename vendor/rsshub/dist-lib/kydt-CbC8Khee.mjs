import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/chsi/kydt.ts
const host = "https://yz.chsi.com.cn";
const route = {
	path: "/kydt",
	categories: ["study"],
	example: "/chsi/kydt",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["yz.chsi.com.cn/kyzx/kydt"] }],
	name: "考研动态",
	maintainers: ["SunBK201"],
	handler,
	url: "yz.chsi.com.cn/kyzx/kydt"
};
async function handler() {
	const $ = load((await got_default(`${host}/kyzx/kydt`)).data);
	const list = $("ul.news-list").children();
	const items = await Promise.all(list.map((i, item) => {
		item = $(item);
		const itemTitle = item.find("a").text();
		const itemDate = item.find(".span-time").text();
		const path = item.find("a").attr("href");
		const itemUrl = path.startsWith("http") ? path : host + path;
		return cache_default.tryGet(itemUrl, async () => {
			let description;
			if (!path.startsWith("https://") && !path.startsWith("http://")) description = load((await got_default(itemUrl)).data)("#article_dnull").html().trim();
			else description = itemTitle;
			return {
				title: itemTitle,
				link: itemUrl,
				pubDate: timezone(parseDate(itemDate), 8),
				description
			};
		});
	}));
	return {
		title: "中国研究生招生信息网 - 考研动态",
		link: `${host}/kyzx/kydt/`,
		description: "中国研究生招生信息网 - 考研动态",
		item: items
	};
}
//#endregion
export { route };
