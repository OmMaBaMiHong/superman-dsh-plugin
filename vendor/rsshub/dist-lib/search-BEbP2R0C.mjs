import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as utils_default } from "./utils-5Z8PrdvC.mjs";
import { load } from "cheerio";
//#region lib/routes/pianyuan/search.ts
const route = {
	path: "/indexers/pianyuan/results/search/api",
	radar: [{
		source: ["pianyuan.org/"],
		target: "/index"
	}],
	name: "Unknown",
	maintainers: ["jerry1119"],
	handler,
	url: "pianyuan.org/"
};
async function handler(ctx) {
	const link_base = "https://pianyuan.org/";
	const description = "搜索";
	const link = `https://pianyuan.org/search?q=${ctx.originalUrl.split("&q=", 2)[1]}`;
	const $ = load((await utils_default.request(link, cache_default)).data);
	const searchLinks = $(".nomt > a").toArray().map((a) => $(a).attr("href"));
	if (searchLinks.length === 0) throw new Error("pianyuan 搜索失败");
	const detailLinks = [];
	await Promise.all(searchLinks.map(async (e) => {
		const link = new URL(e, link_base).href;
		return await cache_default.tryGet(link, async () => {
			const content = load((await utils_default.request(link, cache_default)).data);
			detailLinks.push(...content(".ico.ico_bt").toArray().map((a) => $(a).attr("href")));
		});
	}));
	return {
		title: "片源网",
		description,
		link: link_base,
		item: await utils_default.ProcessFeed(detailLinks, cache_default)
	};
}
//#endregion
export { route };
