import { t as processZxfkItems } from "./util-DaZeUdJb.mjs";
//#region lib/routes/gov/safe/complaint.ts
const route = {
	path: "/complaint/:site?",
	categories: ["government"],
	example: "/gov/safe/complaint/beijing",
	parameters: { site: "站点，见上表，默认为 beijing" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "投诉建议",
	maintainers: ["nczitzk"],
	handler
};
async function handler(ctx) {
	const { site = "beijing" } = ctx.req.param();
	return await processZxfkItems(site, "tsjy", ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 5);
}
//#endregion
export { route };
