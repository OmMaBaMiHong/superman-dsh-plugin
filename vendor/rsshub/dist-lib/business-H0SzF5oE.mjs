import { t as processZxfkItems } from "./util-DaZeUdJb.mjs";
//#region lib/routes/gov/safe/business.ts
const route = {
	path: "/business/:site?",
	categories: ["government"],
	example: "/gov/safe/business/beijing",
	parameters: { site: "站点，见上表，默认为 beijing" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "业务咨询",
	maintainers: ["nczitzk"],
	handler
};
async function handler(ctx) {
	const { site = "beijing" } = ctx.req.param();
	return await processZxfkItems(site, "ywzx", ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 3);
}
//#endregion
export { route };
