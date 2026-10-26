import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { t as getHeaders } from "./utils-B0H7APTF2.mjs";
import { load } from "cheerio";
//#region lib/routes/smzdm/product.ts
const route = {
	path: "/product/:id",
	categories: ["shopping"],
	example: "/smzdm/product/zm5vzpe",
	parameters: { id: "商品 id，网址上直接可以看到" },
	features: {
		requireConfig: [{
			name: "SMZDM_COOKIE",
			description: "什么值得买登录后的 Cookie 值"
		}],
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["wiki.smzdm.com/p/:id"],
		target: "/product/:id"
	}],
	name: "商品",
	maintainers: ["chesha1"],
	handler
};
async function handler(ctx) {
	if (!config.smzdm.cookie) throw new ConfigNotFoundError("什么值得买排行榜 is disabled due to the lack of SMZDM_COOKIE");
	const link = `https://wiki.smzdm.com/p/${ctx.req.param("id")}`;
	const $ = load(await rofetch(link, { headers: getHeaders() }));
	const title = $("title").text();
	const items = $("ul#feed-main-list li").toArray().map((elem) => {
		const altText = $(elem).find("img").attr("alt");
		const link = $(elem).find("h5.feed-block-title a").attr("href");
		const price = $(elem).find(".z-highlight").text();
		return {
			title: altText + " " + price,
			link,
			description: $(elem).find(".feed-block-descripe").text().replaceAll(/\s+/g, "")
		};
	});
	return {
		title,
		link,
		item: (await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
			const $ = load(await rofetch(item.link, { headers: getHeaders() }));
			if ($("span.old").length > 0) return null;
			item.pubDate = $("meta[name=\"weibo:webpage:create_at\"]").attr("content");
			if (item.description === "阅读全文") item.description = $("p[itemprop=\"description\"]").first().html();
			return item;
		})))).filter((result) => result !== null)
	};
}
//#endregion
export { route };
