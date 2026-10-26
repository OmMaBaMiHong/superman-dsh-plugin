import { n as fetchArticles, t as BASE_URL } from "./common-BX77bmzQ.mjs";
//#region lib/routes/openai/news.ts
const route = {
	path: "/news",
	categories: ["programming"],
	example: "/openai/news",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "News",
	maintainers: [
		"goestav",
		"StevenRCE0",
		"nczitzk"
	],
	handler
};
async function handler(ctx) {
	const limit = Number.parseInt(ctx.req.query("limit") || "10");
	return {
		title: "OpenAI News",
		link: new URL("/news/", BASE_URL).href,
		item: await fetchArticles(limit)
	};
}
//#endregion
export { route };
