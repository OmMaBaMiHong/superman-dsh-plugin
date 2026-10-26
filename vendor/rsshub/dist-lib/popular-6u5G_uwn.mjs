import { t as utils_default } from "./utils-BohmnXcx.mjs";
//#region lib/routes/dribbble/popular.ts
const route = {
	path: "/popular/:timeframe?",
	categories: ["design"],
	example: "/dribbble/popular",
	parameters: { timeframe: "support the following values: week, month, year and ever" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["dribbble.com/"],
		target: "/popular"
	}],
	name: "Popular",
	maintainers: ["DIYgod", "loganrockmore"],
	handler,
	url: "dribbble.com/"
};
async function handler(ctx) {
	const timeframe = ctx.req.param("timeframe");
	const url = `https://dribbble.com/shots/popular${timeframe ? `?timeframe=${timeframe}` : ""}`;
	return await utils_default.getData(url, "Dribbble - Popular Shots");
}
//#endregion
export { route };
