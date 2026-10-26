import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { i as parseList, n as fetchItem, r as getSafeLineCookieWithData, t as baseUrl } from "./utils-B3FX6AVY.mjs";
import * as cheerio from "cheerio";
import pMap from "p-map";
//#region lib/routes/zaker/focus.ts
const route = {
	path: "/focusread",
	radar: [{
		source: ["www.myzaker.com/"],
		target: "/focusread"
	}],
	name: "精读",
	example: "/zaker/focusread",
	maintainers: ["AlexdanerZe", "TonyRL"],
	handler
};
async function handler() {
	const link = `${baseUrl}/?pos=selected_article`;
	const { cookie, data } = await getSafeLineCookieWithData(link);
	return {
		title: "ZAKER 精读新闻",
		link,
		item: await pMap(parseList(cheerio.load(data)), (item) => cache_default.tryGet(item.link, () => fetchItem(item, cookie)), { concurrency: 2 })
	};
}
//#endregion
export { route };
