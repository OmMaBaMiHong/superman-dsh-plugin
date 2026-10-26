import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/xmut/jwc/bkjw.ts
const xmut = "https://jwc.xmut.edu.cn";
const route = {
	path: "/jwc/bkjw/:category?",
	name: "Unknown",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const { category = "jwxt" } = ctx.req.param();
	const url = `${xmut}/index/tzgg/${category}.htm`;
	const $ = load((await got_default(url, { headers: { referer: xmut } })).data);
	const itemsArray = $("#result_list table tbody tr").toArray().map((row) => {
		const res = $("td", row).eq(0);
		const resDate = $("td", row).eq(1);
		const resLink = $("a", res).attr("href");
		let link;
		if (resLink.startsWith("../../")) link = new URL(resLink, xmut).href;
		else link = resLink;
		const title = $("a", res).attr("title");
		const pubDate = parseDate(resDate.text().trim());
		return {
			title,
			link,
			pubDate
		};
	});
	const items = await Promise.all(itemsArray.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = load((await got_default(item.link, { headers: { referer: xmut } })).data)("table #result #content form div #vsb_content_6").html();
		return item;
	})));
	return {
		title: $("title").text(),
		link: url,
		item: items
	};
}
//#endregion
export { route };
