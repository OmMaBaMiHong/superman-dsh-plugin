import "./types-DNj6Etbg.mjs";
import { t as fetchContentItems } from "./utils-Dav9iWKQ.mjs";
//#region lib/routes/ainvest/news.ts
const route = {
	path: "/news",
	categories: ["finance"],
	example: "/ainvest/news",
	parameters: {},
	view: 0,
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.ainvest.com/news/"] }],
	name: "Latest News",
	maintainers: ["TonyRL"],
	handler,
	url: "www.ainvest.com/news/"
};
async function handler(ctx) {
	return {
		title: "AInvest - Latest News",
		link: "https://www.ainvest.com/news/",
		language: "en",
		item: await fetchContentItems([
			109,
			416,
			438,
			529,
			721,
			834,
			835
		], ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 5)
	};
}
//#endregion
export { route };
