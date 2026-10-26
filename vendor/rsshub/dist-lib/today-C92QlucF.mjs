import { n as outPlaywright } from "./playwright-DGfbX7qN.mjs";
import { n as parsePage, t as baseUrl } from "./utils-BSOSMbsG.mjs";
//#region lib/routes/cw/today.ts
const route = {
	path: "/today",
	categories: ["traditional-media"],
	example: "/cw/today",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: true,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["cw.com.tw/today", "cw.com.tw/"] }],
	name: "最新上線",
	maintainers: ["TonyRL"],
	handler,
	url: "cw.com.tw/today"
};
async function handler(ctx) {
	const context = await outPlaywright();
	const { $, items } = await parsePage("today", context, ctx);
	await context.close();
	return {
		title: $("head title").text(),
		description: $("meta[name=description]").attr("content"),
		link: `${baseUrl}/today`,
		image: `${baseUrl}/assets_new/img/fbshare.jpg`,
		language: $("meta[property=\"og:locale\"]").attr("content"),
		item: items
	};
}
//#endregion
export { route };
