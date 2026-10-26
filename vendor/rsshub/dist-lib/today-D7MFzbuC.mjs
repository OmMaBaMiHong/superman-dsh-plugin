import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/kbs/today.ts
const route = {
	path: "/today/:language?",
	categories: ["new-media"],
	example: "/kbs/today",
	parameters: { language: "Language, see below, e as English by default" },
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
		target: "/today"
	}],
	name: "Today",
	maintainers: ["nczitzk"],
	handler,
	url: "world.kbs.co.kr/",
	description: `| 한국어 | عربي | 中国语 | English | Français | Deutsch | Bahasa Indonesia | 日本語 | Русский | Español | Tiếng Việt |
| ------ | ---- | ------ | ------- | -------- | ------- | ---------------- | ------ | ------- | ------- | ---------- |
| k      | a    | c      | e       | f        | g       | i                | j      | r       | s       | v          |`
};
async function handler(ctx) {
	const language = ctx.req.param("language") ?? "e";
	const rootUrl = "http://world.kbs.co.kr";
	const currentUrl = `${rootUrl}/service/news_today.htm?lang=${language}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	const list = $(".comp_text_1x article").toArray().map((item) => {
		item = $(item);
		const a = item.find("h2 a");
		return {
			title: a.text(),
			category: item.find(".cate").text(),
			link: `${rootUrl}/service${a.attr("href").replace("./", "/")}`,
			pubDate: timezone(parseDate(item.find(".date").text()), 9)
		};
	});
	return {
		title: "Latest News | KBS WORLD",
		link: currentUrl,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			item.description = load((await got_default({
				method: "get",
				url: item.link
			})).data)(".body_txt").html();
			return item;
		})))
	};
}
//#endregion
export { route };
