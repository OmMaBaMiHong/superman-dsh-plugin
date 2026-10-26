import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/douban/other/explore-column.ts
const host = "https://www.douban.com/explore/column/";
const route = {
	path: "/explore/column/:id",
	name: "Unknown",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const link = new URL(id, host).href;
	const $ = load((await got_default.get(link)).data);
	const title = $("div.h1").text();
	const list = $("div.item").slice(0, 10).toArray().map((item) => {
		return {
			title: $(item).find("div.title a").text(),
			link: $(item).find("div.title a").attr("href"),
			author: $(item).find("div.usr-pic a").text()
		};
	});
	for (let i = list.length - 1; i >= 0; i--) if (list[i].author === "[已注销]") list.splice(i, 1);
	const out = await Promise.all(list.map(async (info) => {
		const title = info.title;
		const author = info.author;
		const itemUrl = info.link;
		return {
			title,
			link: itemUrl,
			description: load((await got_default.get(itemUrl)).data)("#link-report").html(),
			author
		};
	}));
	return {
		title: `${title}-豆瓣发现`,
		link,
		item: out
	};
}
//#endregion
export { route };
