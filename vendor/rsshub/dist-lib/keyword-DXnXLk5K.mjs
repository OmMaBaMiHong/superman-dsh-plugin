import { t as utils_default } from "./utils-BohmnXcx.mjs";
//#region lib/routes/dribbble/keyword.ts
const route = {
	path: "/keyword/:keyword",
	categories: ["design"],
	example: "/dribbble/keyword/player",
	parameters: { keyword: "desired keyword" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Keyword",
	maintainers: ["DIYgod", "loganrockmore"],
	handler
};
async function handler(ctx) {
	const keyword = ctx.req.param("keyword");
	const url = `https://dribbble.com/search/shots/recent?q=${keyword}`;
	const title = `Dribbble - keyword ${keyword}`;
	return await utils_default.getData(url, title);
}
//#endregion
export { route };
