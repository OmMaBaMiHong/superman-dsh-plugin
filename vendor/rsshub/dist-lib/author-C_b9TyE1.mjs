import { n as outPlaywright } from "./playwright-DGfbX7qN.mjs";
import { n as parsePage, t as baseUrl } from "./utils-BSOSMbsG.mjs";
//#region lib/routes/cw/author.ts
const route = {
	path: "/author/:channel",
	categories: ["traditional-media"],
	example: "/cw/author/57",
	parameters: { channel: "作者 ID，可在 URL 中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: true,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["cw.com.tw/author/:channel"] }],
	name: "作者",
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	const context = await outPlaywright();
	const { $, items } = await parsePage("author", context, ctx);
	await context.close();
	return {
		title: $("head title").text(),
		description: $(".authorTxt").text(),
		link: `${baseUrl}/author/${ctx.req.param("channel")}`,
		image: $(".authorPhoto img").attr("src") || `https://www.cw.com.tw/assets_new/img/fbshare.jpg'`,
		language: $("meta[property=\"og:locale\"]").attr("content"),
		item: items
	};
}
//#endregion
export { route };
