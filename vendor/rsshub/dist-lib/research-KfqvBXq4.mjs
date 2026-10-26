import { n as fetchArticles, t as BASE_URL } from "./common-BX77bmzQ.mjs";
//#region lib/routes/openai/research.ts
const route = {
	path: "/research",
	categories: ["programming"],
	example: "/openai/research",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Research",
	maintainers: ["yuguorui", "chesha1"],
	handler
};
async function handler(ctx) {
	const limit = Number.parseInt(ctx.req.query("limit") || "10");
	return {
		title: "OpenAI Research",
		link: new URL("/research/index", BASE_URL).href,
		item: await fetchArticles(limit, "Research")
	};
}
//#endregion
export { route };
