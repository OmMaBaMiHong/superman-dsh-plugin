import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/shu/jwb.ts
const host = "https://jwb.shu.edu.cn/";
const alias = /* @__PURE__ */ new Map([["notice", "tzgg"], ["news", "xw"]]);
const route = {
	path: "/jwb/:type?",
	radar: [{
		source: ["www.shu.edu.cn/index"],
		target: "/:type?"
	}],
	name: "教务部",
	maintainers: ["tuxinghuan", "GhhG123"],
	handler,
	description: `| 通知通告 | 新闻 | 政策文件 (bug) |
| -------- | ---- | -------------- |
| notice   | news | policy         |`
};
async function handler(ctx) {
	const type = ctx.req.param("type") || "notice";
	const link = `https://jwb.shu.edu.cn/index/${alias.get(type) || type}.htm`;
	const $ = load((await got_default.get(link)).data);
	const title = $("title").text();
	const list = $(".only-list").find("li").slice(0, 10).toArray().map((ele) => ({
		title: $(ele).find("a").text(),
		link: new URL($(ele).find("a").attr("href"), host).href,
		date: $(ele).children("span").text()
	}));
	return {
		title,
		link,
		image: "https://www.shu.edu.cn/__local/0/08/C6/1EABE492B0CF228A5564D6E6ABE_779D1EE3_5BF7.png",
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const $ = load((await got_default.get(item.link)).data);
			item.author = $("[id$=_lblUser]").text().trim();
			item.pubDate = parseDate(item.date, "YYYY年MM月DD日");
			item.description = $(".v_news_content").html() || item.title;
			return item;
		})))
	};
}
//#endregion
export { route };
