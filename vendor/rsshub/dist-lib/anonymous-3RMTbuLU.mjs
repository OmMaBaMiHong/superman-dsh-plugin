import { t as got_default } from "./got-Dnzt41dd.mjs";
import { r as getPlurk, t as baseUrl } from "./utils-BmJCEArY.mjs";
//#region lib/routes/plurk/anonymous.ts
const route = {
	path: "/anonymous",
	categories: ["social-media"],
	example: "/plurk/anonymous",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["plurk.com/anonymous"] }],
	name: "Anonymous",
	maintainers: ["TonyRL"],
	handler,
	url: "plurk.com/anonymous"
};
async function handler(ctx) {
	const { data: apiResponse } = await got_default(`${baseUrl}/Stats/getAnonymousPlurks`, { searchParams: {
		offset: 0,
		limit: ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 200
	} });
	delete apiResponse.pids;
	delete apiResponse.count;
	const items = await Promise.all(Object.values(apiResponse).map((item) => getPlurk(`plurk:${item.plurk_id}`, item, "ಠ_ಠ")));
	return {
		title: "Anonymous - Plurk",
		image: "https://s.plurk.com/2c1574c02566f3b06e91.png",
		link: `${baseUrl}/anonymous`,
		item: items
	};
}
//#endregion
export { route };
