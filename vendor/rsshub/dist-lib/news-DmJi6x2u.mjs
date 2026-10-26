import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/icac/utils.ts
const BASE_URL = "https://www.icac.org.hk";
const LANG_TYPE = {
	en: "en-us",
	sc: "zh-cn",
	tc: "zh-hk"
};
function langBase(lang) {
	return lang ? `${BASE_URL}/${lang}` : "https://www.icac.org.hk/sc";
}
var utils_default = {
	LANG_TYPE,
	BASE_URL,
	langBase
};
//#endregion
//#region lib/routes/icac/news.ts
const route = {
	path: "/news/:lang?",
	categories: ["government"],
	example: "/icac/news/sc",
	parameters: { lang: "Language, default to `sc`. Supprot `en`(English), `sc`(Simplified Chinese) and `tc`(Traditional Chinese)" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["icac.org.hk/:lang/press/index.html"],
		target: "/news/:lang"
	}],
	name: "Press Releases",
	maintainers: ["linbuxiao, TonyRL"],
	handler
};
async function handler(ctx) {
	const BASE_WITH_LANG = utils_default.langBase(ctx.req.param("lang"));
	const list = load((await got_default.get(`${BASE_WITH_LANG}/press/index.html`)).data)(".pressItem.clearfix").toArray().map((e) => {
		const c = load(e);
		return {
			title: c(".hd a").text(),
			link: `${utils_default.BASE_URL}${c(".hd a").attr("href")}`
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const c = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		c(".btn_download").remove();
		c(".col-3-wrap.clearfix.pressPhoto div").removeAttr("class");
		const des = c(".pressContent.full").html();
		const thumbs = c(".col-3-wrap.clearfix.pressPhoto").html() ?? "";
		item.pubDate = parseDate(decodeURI(c(".date").text().trim()), [
			"YYYY年MM月DD日",
			"YYYY年MM月D日",
			"YYYY年M月DD日",
			"YYYY年M月D日"
		], true);
		item.description = des + thumbs;
		return item;
	})));
	return {
		title: "ICAC 新闻公布",
		link: `${BASE_WITH_LANG}/press/index.html`,
		description: "ICAC 新闻公布",
		language: ctx.req.param("lang") ? utils_default.LANG_TYPE[ctx.req.param("lang")] : utils_default.LANG_TYPE.sc,
		item: items
	};
}
//#endregion
export { route };
