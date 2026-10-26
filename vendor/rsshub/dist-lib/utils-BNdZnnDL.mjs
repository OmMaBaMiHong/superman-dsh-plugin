import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as getAcwScV2ByArg1 } from "./utils-BiyO2GgI2.mjs";
import { load } from "cheerio";
//#region lib/routes/segmentfault/utils.ts
const host = "https://segmentfault.com";
const acw_sc__v2 = (link) => cache_default.tryGet("segmentfault:acw_sc__v2", async () => {
	const response = await rofetch(link);
	let acw_sc__v2 = "";
	const matches = response.match(/var arg1='(.*?)';/);
	if (matches) acw_sc__v2 = getAcwScV2ByArg1(matches[1]);
	return acw_sc__v2;
}, config.cache.routeExpire, false);
const parseList = (data) => data.map((item) => ({
	title: item.title,
	link: new URL(item.url, host).href,
	author: item.user.name,
	pubDate: parseDate(item.created || item.modified, "X"),
	description: item.excerpt
}));
const parseItems = (cookie, item) => cache_default.tryGet(item.link, async () => {
	try {
		const content = load(await rofetch(item.link, { headers: { cookie: `acw_sc__v2=${cookie};` } }));
		item.description = content("article").html();
		item.category = content(".badge-tag").toArray().map((item) => content(item).text());
	} catch {}
	return item;
});
//#endregion
export { parseList as i, host as n, parseItems as r, acw_sc__v2 as t };
