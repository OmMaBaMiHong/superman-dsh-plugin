import { n as outPlaywright } from "./playwright-DGfbX7qN.mjs";
import { n as parsePage, t as baseUrl } from "./utils-BSOSMbsG.mjs";
//#region lib/routes/cw/sub.ts
const route = {
	path: "/sub/:channel",
	categories: ["traditional-media"],
	example: "/cw/sub/615",
	parameters: { channel: "子頻道 ID，可在 URL 中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: true,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "子頻道",
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	const context = await outPlaywright();
	const { $, items } = await parsePage("sub", context, ctx);
	await context.close();
	return {
		title: $("head title").text(),
		description: $("meta[name=description]").attr("content"),
		link: `${baseUrl}/subchannel.action?idSubChannel=${ctx.req.param("channel")}`,
		image: `${baseUrl}/assets_new/img/fbshare.jpg`,
		language: $("meta[property=\"og:locale\"]").attr("content"),
		item: items
	};
}
//#endregion
export { route };
