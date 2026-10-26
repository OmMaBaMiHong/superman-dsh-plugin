import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/pku/utils.ts
const eecsMap = /* @__PURE__ */ new Map([
	[0, "qb.htm"],
	[1, "xytz.htm"],
	[2, "rstz.htm"],
	[6, "jwtz.htm"],
	[8, "xgtz.htm"],
	[7, "kytz.htm"],
	[5, "cwtz.htm"],
	[3, "ghtz.htm"],
	[4, "yytz.htm"]
]);
//#endregion
//#region lib/routes/pku/eecs.ts
const route = {
	path: "/eecs/:type?",
	name: "Unknown",
	maintainers: ["Ir1d"],
	handler
};
async function handler(ctx) {
	const host = "https://eecs.pku.edu.cn";
	let type = ctx.params && Number.parseInt(ctx.req.param("type"));
	if (type === void 0) type = 0;
	const $ = load((await got_default("https://eecs.pku.edu.cn/xygk1/ggtz/" + eecsMap.get(type))).data);
	let items = $(".hvr-shutter-out-vertical").toArray().map((item) => {
		item = $(item);
		return {
			title: item.attr("title"),
			link: new URL(item.attr("href"), host).href,
			pubDate: parseDate(item.find("em").text())
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default(item.link)).data);
		content("input").remove();
		content("h1").remove();
		content(".con_xq").remove();
		content("form[name=_newscontent_fromname] img").each((_, i) => {
			i = $(i);
			if (i.attr("src").startsWith("/")) i.attr("src", new URL(i.attr("src"), host).href);
		});
		content("form[name=_newscontent_fromname] ul li a").each((_, a) => {
			a = $(a);
			if (a.attr("href").startsWith("/")) a.attr("href", new URL(a.attr("href"), host).href);
		});
		item.description = content("form[name=_newscontent_fromname]").html();
		return item;
	})));
	return {
		title: $("title").text(),
		link: "https://eecs.pku.edu.cn/xygk1/ggtz/" + eecsMap.get(type),
		description: "北大信科 公告通知",
		item: items
	};
}
//#endregion
export { route };
