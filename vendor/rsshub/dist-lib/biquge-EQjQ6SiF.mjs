import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { r as getSubPath } from "./common-utils-xJr7JYuG.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { load } from "cheerio";
import iconv from "iconv-lite";
//#region lib/routes/biquge/index.ts
const allowHost = /* @__PURE__ */ new Set([
	"www.xbiquwx.la",
	"www.biqu5200.net",
	"www.xbiquge.so",
	"www.biqugeu.net",
	"www.b520.cc",
	"www.ahfgb.com",
	"www.ibiquge.la",
	"www.biquge.tv",
	"www.bswtan.com",
	"www.biquge.co",
	"www.bqzhh.com",
	"www.biqugse.com",
	"www.ibiquge.info",
	"www.ishuquge.com",
	"www.mayiwxw.com"
]);
const route = {
	path: "*",
	name: "Unknown",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const rootUrl = getSubPath(ctx).split("/").slice(1, 4).join("/");
	const currentUrl = getSubPath(ctx).slice(1);
	if (!config.feature.allow_user_supply_unsafe_domain && !allowHost.has(new URL(rootUrl).hostname)) throw new ConfigNotFoundError(`This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`);
	const response = await got_default(currentUrl, { responseType: "buffer" });
	const encoding = /charset="?'?gb/i.test(response.data.toString()) ? "gbk" : "utf-8";
	const $ = load(iconv.decode(response.data, encoding));
	const author = $("meta[property=\"og:novel:author\"]").attr("content");
	const pubDate = timezone(parseDate($("meta[property=\"og:novel:update_time\"]").attr("content")), 8);
	let items = $("dl dd a").toArray().toReversed().slice(0, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 1).map((item) => {
		item = $(item);
		let link;
		const url = item.attr("href");
		if (url.startsWith("http")) link = url;
		else if (url.startsWith("/")) link = `${rootUrl}${url}`;
		else link = `${currentUrl}/${url}`;
		return {
			title: item.text(),
			link,
			author,
			pubDate
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const detailResponse = await got_default(item.link, { responseType: "buffer" });
		item.description = load(iconv.decode(detailResponse.data, encoding))("#content").html();
		return item;
	})));
	return {
		title: `${$("meta[property=\"og:title\"]").attr("content")} - 笔趣阁`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
