import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { i as parseList, n as fetchItem, r as getSafeLineCookieWithData, t as baseUrl } from "./utils-B3FX6AVY.mjs";
import * as cheerio from "cheerio";
import pMap from "p-map";
//#region lib/routes/zaker/channel.ts
const route = {
	path: "/channel/:id?",
	parameters: { id: "分类 ID，可在 URL 中找到，默认为 `1`" },
	radar: [{
		source: ["www.myzaker.com/channel/:id"],
		target: "/channel/:id"
	}],
	name: "分类",
	example: "/zaker/channel/13",
	maintainers: [
		"LogicJake",
		"kt286",
		"TonyRL"
	],
	handler
};
async function handler(ctx) {
	const link = `${baseUrl}/channel/${ctx.req.param("id") ?? 1}`;
	const { cookie, data } = await getSafeLineCookieWithData(link);
	const $ = cheerio.load(data);
	return {
		title: $("head title").text(),
		link,
		item: await pMap(parseList($), (item) => cache_default.tryGet(item.link, () => fetchItem(item, cookie)), { concurrency: 2 })
	};
}
//#endregion
export { route };
