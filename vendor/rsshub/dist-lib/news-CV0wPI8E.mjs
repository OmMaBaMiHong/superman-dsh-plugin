import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/kbs/news.ts
const route = {
	path: "/news/:category?/:language?",
	categories: ["new-media"],
	example: "/kbs/news",
	parameters: {
		category: "Category, can be found in Url as `id`, all by default",
		language: "Language, see below, e as English by default"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["world.kbs.co.kr/"],
		target: "/news"
	}],
	name: "News",
	maintainers: ["nczitzk"],
	handler,
	url: "world.kbs.co.kr/",
	description: `| 한국어 | عربي | 中国语 | English | Français | Deutsch | Bahasa Indonesia | 日本語 | Русский | Español | Tiếng Việt |
| ------ | ---- | ------ | ------- | -------- | ------- | ---------------- | ------ | ------- | ------- | ---------- |
| k      | a    | c      | e       | f        | g       | i                | j      | r       | s       | v          |`
};
async function handler(ctx) {
	const category = ctx.req.param("category") ?? "all";
	const language = ctx.req.param("language") ?? "e";
	const rootUrl = "http://world.kbs.co.kr";
	const currentUrl = `${rootUrl}/service/news_list.htm?lang=${language}${category === "all" ? "" : `&id=${category}`}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	$(".comp_pagination").remove();
	const list = $(".comp_contents_1x article").toArray().map((item) => {
		item = $(item);
		const a = item.find("h2 a");
		return {
			title: a.text(),
			category: item.find(".cate").text(),
			link: `${rootUrl}/service${a.attr("href").replace("./", "/")}`,
			pubDate: timezone(parseDate(item.find(".date").text().match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/)[1]), 9)
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = load((await got_default({
			method: "get",
			url: item.link
		})).data)(".body_txt").html();
		return item;
	})));
	return {
		title: `${$(".active").text() || list[0].category} - KBS WORLD`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
