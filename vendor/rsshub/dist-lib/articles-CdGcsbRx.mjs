import "./types-DNj6Etbg.mjs";
import { r as processItems, t as baseUrl } from "./util-n4gNRv9n.mjs";
//#region lib/routes/gcores/articles.ts
const handler = async (ctx) => {
	const limit = Number(ctx.req.query("limit") ?? "30");
	const targetUrl = new URL("articles", baseUrl).href;
	const apiUrl = new URL("gapi/v1/articles", baseUrl).href;
	return await processItems(limit, {
		"page[limit]": limit,
		sort: "-published-at",
		include: "category,user,media",
		"filter[list-all]": 1,
		"filter[is-news]": 0
	}, apiUrl, targetUrl);
};
const route = {
	path: "/articles",
	name: "文章",
	url: "www.gcores.com",
	maintainers: ["nczitzk"],
	handler,
	example: "/gcores/articles",
	parameters: void 0,
	description: void 0,
	categories: ["game"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportRadar: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["www.gcores.com/articles"],
		target: "/gcores/articles"
	}],
	view: 0
};
//#endregion
export { handler, route };
