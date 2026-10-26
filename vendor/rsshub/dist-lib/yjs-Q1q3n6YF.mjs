import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/xmut/jwc/yjs.ts
const xmut = "https://yjs.xmut.edu.cn";
const route = {
	path: "/jwc/yjjw/:category?",
	name: "Unknown",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const { category = "yjsc" } = ctx.req.param();
	const url = `${xmut}/index/${category}.htm`;
	const $ = load((await got_default(url, { headers: { referer: xmut } })).data);
	const items = $(".mainWrap .main_con .main_conR ul li").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find("em").text(),
			link: `${xmut}/` + item.find("a").attr("href"),
			pubDate: parseDate(item.find("span").text())
		};
	});
	const itemPromises = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = load((await got_default(item.link, { headers: { referer: xmut } })).data)("body .mainWrap .main_content .v_news_content").html();
		return item;
	})));
	return {
		title: $("title").text(),
		link: url,
		item: itemPromises
	};
}
//#endregion
export { route };
