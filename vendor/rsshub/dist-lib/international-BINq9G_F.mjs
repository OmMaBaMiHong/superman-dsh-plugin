import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/xjtu/international.ts
const route = {
	path: "/international/:subpath{.+}",
	name: "Unknown",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const subpath = ctx.req.param("subpath");
	const base = "http://international.xjtu.edu.cn";
	const url = `${base}/${subpath.split(".", 1)[0]}.htm`;
	const $ = load((await got_default(url)).data);
	const name = $("div.pageTitle").text();
	const list = $(".news-list-a > .c").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find("a").attr("title"),
			pubDate: parseDate(item.find("p.list-time").text()),
			link: new URL(item.find("a").attr("href"), base).href
		};
	});
	const item = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		if (new URL(item.link).pathname.startsWith === "/content.jsp") return item;
		item.description = load((await got_default(item.link)).data)("div.ctnCont").html();
		return item;
	})));
	return {
		title: `西安交通大学国际处 - ${name}`,
		link: url,
		description: `西安交通大学国际处 - ${name}`,
		item
	};
}
//#endregion
export { route };
