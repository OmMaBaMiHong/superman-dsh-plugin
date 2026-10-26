import { i as getPosts, n as SUB_URL, t as SUB_NAME_PREFIX } from "./utils-BfhaY54R.mjs";
//#region lib/routes/8kcos/latest.ts
const route = {
	path: "/",
	categories: ["picture"],
	example: "/8kcos",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	radar: [{ source: ["8kcosplay.com/"] }],
	name: "最新",
	maintainers: ["KotoriK"],
	handler,
	url: "8kcosplay.com/"
};
async function handler(ctx) {
	const items = await getPosts(Number(ctx.req.query("limit") ?? 10));
	return {
		title: `${SUB_NAME_PREFIX}-最新`,
		link: SUB_URL,
		item: items
	};
}
//#endregion
export { route };
