import { t as fetchContentItems } from "./utils-Dav9iWKQ.mjs";
//#region lib/routes/ainvest/article.ts
const route = {
	path: "/article",
	categories: ["finance"],
	example: "/ainvest/article",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.ainvest.com/news/articles-latest/", "www.ainvest.com"] }],
	name: "Latest Article",
	maintainers: ["TonyRL"],
	handler,
	url: "www.ainvest.com/news/articles-latest/"
};
async function handler(ctx) {
	return {
		title: "AInvest - Latest Articles",
		link: "https://www.ainvest.com/news/articles-latest/",
		language: "en",
		item: await fetchContentItems([109], ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 5)
	};
}
//#endregion
export { route };
