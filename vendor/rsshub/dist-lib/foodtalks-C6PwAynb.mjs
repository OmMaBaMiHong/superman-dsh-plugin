import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { a as namespace, i as processItems, n as baseUrl, r as parseList, t as apiBaseUrl } from "./utils-CiQT4CFr.mjs";
//#region lib/routes/foodtalks/index.ts
const route = {
	path: "/",
	categories: namespace.categories,
	example: "/foodtalks",
	radar: [{ source: ["www.foodtalks.cn"] }],
	name: "最新资讯",
	maintainers: ["Geraldxm"],
	handler,
	url: "www.foodtalks.cn"
};
async function handler(ctx) {
	const items = await processItems(parseList((await rofetch(`${apiBaseUrl}/news/news/page?current=1&size=${Number(ctx.req.query("limit")) || 15}&isLatest=1&language=ZH`, { headers: { referer: `${baseUrl}/` } })).data.records));
	return {
		title: namespace.name,
		description: namespace.description,
		link: "https://" + namespace.url,
		item: items,
		image: `${baseUrl}/favicon.ico`
	};
}
//#endregion
export { route };
