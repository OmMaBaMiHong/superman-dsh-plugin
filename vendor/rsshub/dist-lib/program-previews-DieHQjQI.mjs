import "./types-DNj6Etbg.mjs";
import { r as processItems, t as baseUrl } from "./util-n4gNRv9n.mjs";
//#region lib/routes/gcores/program-previews.ts
const handler = async (ctx) => {
	const limit = Number(ctx.req.query("limit") ?? "30");
	const targetUrl = new URL("radios/preview", baseUrl).href;
	const apiUrl = new URL("gapi/v1/program-previews", baseUrl).href;
	return await processItems(limit, {
		"page[limit]": limit,
		include: "radio.djs,video.djs,radio.category,video.category"
	}, apiUrl, targetUrl);
};
const route = {
	path: "/radios/preview",
	name: "预告",
	url: "www.gcores.com",
	maintainers: ["nczitzk"],
	handler,
	example: "/gcores/radios/preview",
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
		source: ["www.gcores.com/radios/preview"],
		target: "/gcores/radios/preview"
	}],
	view: 5
};
//#endregion
export { handler, route };
