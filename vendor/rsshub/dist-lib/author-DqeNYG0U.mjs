import { i as rootUrl, n as getInfo, r as processItems, t as apiRootUrl } from "./util-C564YIaS.mjs";
//#region lib/routes/cyzone/author.ts
const route = {
	path: "/author/:id",
	categories: ["new-media"],
	example: "/cyzone/author/1225562",
	parameters: { id: "作者 id，可在对应作者页 URL 中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["cyzone.cn/author/:id", "cyzone.cn/"] }],
	name: "作者",
	maintainers: ["nczitzk"],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 5;
	const apiUrl = new URL("v2/author/author/detail", apiRootUrl).href;
	const currentUrl = new URL(`author/${id}`, rootUrl).href;
	return {
		item: await processItems(apiUrl, limit, { author_id: id }),
		...await getInfo(currentUrl)
	};
}
//#endregion
export { route };
