import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/bnu/lib.ts
const route = {
	path: "/lib/:category?",
	radar: [{
		source: ["www.lib.bnu.edu.cn/:category/index.htm"],
		target: "/lib/:category"
	}],
	name: "Unknown",
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	const baseUrl = "http://www.lib.bnu.edu.cn";
	const { category = "zydt" } = ctx.req.param();
	const link = `${baseUrl}/${category}/index.htm`;
	const { data: response } = await got_default(link);
	const $ = load(response);
	const list = $(".view-content .item-list li").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find("a").text(),
			link: `${baseUrl}/${category}/${item.find("a").attr("href")}`,
			pubDate: parseDate(item.find("span > span").eq(1).text(), "YYYY-MM-DD")
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: response } = await got_default(item.link);
		item.description = load(response)("#block-system-main .content .content").html();
		return item;
	})));
	return {
		title: $("head title").text(),
		link,
		item: items
	};
}
//#endregion
export { route };
