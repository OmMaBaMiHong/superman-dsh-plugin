import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
import iconv from "iconv-lite";
//#region lib/routes/stbu/xyxw.ts
const gbk2utf8 = (s) => iconv.decode(s, "gbk");
const route = {
	path: "/xyxw",
	categories: ["university"],
	example: "/stbu/xyxw",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["stbu.edu.cn/html/news/xueyuan", "stbu.edu.cn"] }],
	name: "学院新闻",
	maintainers: ["HyperCherry"],
	handler,
	url: "stbu.edu.cn/html/news/xueyuan"
};
async function handler() {
	const baseUrl = "http://www.stbu.edu.cn";
	const requestUrl = `${baseUrl}/html/news/xueyuan/`;
	const { data: response } = await got_default(requestUrl, { responseType: "buffer" });
	const $ = load(gbk2utf8(response));
	const list = $(".style_2 .Simple_title").toArray().map((item) => {
		item = $(item);
		const a = item.find("a").first();
		return {
			title: a.text(),
			link: `${baseUrl}${a.attr("href")}`
		};
	});
	return {
		title: "四川工商学院 - 学院新闻",
		link: requestUrl,
		description: "四川工商学院 - 学院新闻",
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const { data: response } = await got_default(item.link, { responseType: "buffer" });
			const $ = load(gbk2utf8(response));
			item.description = $(".artmainl .articlemain").first().html();
			item.pubDate = timezone(parseDate($(".artmainl .info").text().split("|", 3)[2].split("：", 2)[1].trim()), 8);
			return item;
		})))
	};
}
//#endregion
export { route };
