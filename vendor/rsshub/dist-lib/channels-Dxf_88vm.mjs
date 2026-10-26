import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/gov/nppa/channels.ts
const route = {
	path: "/:path{.+}",
	name: "通用",
	example: "/gov/nppa/xxfb/ywxx",
	parameters: { path: "路径，留空默认 `xxfb/ywxx`" },
	maintainers: ["y2361547758"],
	handler
};
const host = "https://www.nppa.gov.cn";
async function handler(ctx) {
	const { path = "xxfb/ywxx" } = ctx.req.param();
	const link = `${host}/${path}/`;
	const $ = load(await rofetch(link));
	const list = $(".m2nRcon li").toArray().map((item) => {
		const $item = $(item);
		const a = $item.find("a");
		return {
			link: new URL(a.attr("href"), link).href,
			pubDate: timezone(parseDate($item.find("span").text().replaceAll(/[[\]]/g, "")), 8)
		};
	});
	return {
		title: `国家新闻出版署 - ${$(".m2nRt").text().trim()}`,
		link,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const $ = load(await rofetch(item.link));
			item.title = $(".m3page_t").text().trim() || $("head title").text();
			item.description = $(".m3pageEdit").html() ?? "";
			return item;
		})))
	};
}
//#endregion
export { route };
