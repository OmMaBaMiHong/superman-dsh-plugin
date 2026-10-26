import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/500px/utils.ts
const baseUrl = "https://500px.com.cn";
const headers = {
	"x-500px-client-info": "eyJhbm9ueW1vdXNJZCI6IiIsImxhdGl0dWRlIjpudWxsLCJsb25naXR1ZGUiOm51bGwsIm1hbnVmYWN0dXJlciI6IiIsInByb3ZpbmNlIjoiIiwiYXJlYSI6IiIsImNpdHkiOiIifQ==",
	"X-Tingyun-Id": `Fm3hXcTiLT8;r=${Date.now() % 1e8}`
};
const getTribeDetail = (id) => cache_default.tryGet(`500px:tribeDetail:${id}`, async () => {
	return (await rofetch(`${baseUrl}/community/tribe/tribeDetail`, {
		headers: { ...headers },
		query: { tribeId: id }
	})).data;
}, config.cache.routeExpire, false);
const getTribeSets = (id, limit) => cache_default.tryGet(`500px:tribeSets:${id}`, async () => {
	return (await rofetch(`${baseUrl}/community/tribe/getTribeSetsV2`, {
		headers: { ...headers },
		query: {
			tribeId: id,
			privacy: 1,
			page: 1,
			size: limit,
			type: "json"
		}
	})).data;
}, config.cache.routeExpire, false);
//#endregion
//#region lib/routes/500px/tribe-set.tsx
const route = {
	path: "/tribe/set/:id",
	categories: ["picture"],
	view: 2,
	example: "/500px/tribe/set/f5de0b8aa6d54ec486f5e79616418001",
	parameters: { id: "部落 ID" },
	name: "部落影集",
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const limit = Number.parseInt(ctx.req.query("limit")) || 100;
	const { tribe } = await getTribeDetail(id);
	const items = (await getTribeSets(id, limit)).map((item) => ({
		title: item.title,
		description: renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [item.description ? /* @__PURE__ */ jsx("p", { children: item.description }) : null, item.photos ? item.photos.map((photo) => /* @__PURE__ */ jsx("img", { src: `${photo.url.baseUrl}!p5` })) : null] })),
		author: item.uploaderInfo.nickName,
		pubDate: parseDate(item.createdTime, "x"),
		link: `${baseUrl}/community/set/${item.id}/details`
	}));
	return {
		title: tribe.name,
		description: `${tribe.watchword} - ${tribe.introduce}`,
		link: `${baseUrl}/page/tribe/detail?tribeId=${id}&pagev=set`,
		image: tribe.avatar.a1,
		item: items
	};
}
//#endregion
export { route };
