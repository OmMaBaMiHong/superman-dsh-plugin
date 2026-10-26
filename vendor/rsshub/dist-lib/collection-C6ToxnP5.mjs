import { t as got_default } from "./got-Dnzt41dd.mjs";
import { c as fetchApiRouteData, d as processItems, f as rootUrl, s as buildHuxiuRouteTitlePrefix, t as apiArticleRootUrl } from "./util-CislQG2a.mjs";
//#region lib/routes/huxiu/collection.ts
const route = {
	path: "/collection/:id",
	categories: ["new-media"],
	example: "/huxiu/collection/212",
	parameters: { id: "文集 id，可在对应文集页 URL 中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: true,
		supportScihub: false
	},
	name: "文集",
	maintainers: ["AlexdanerZe", "nczitzk"],
	handler,
	description: "更多文集请参见 [文集](https://www.huxiu.com/collection)"
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 10;
	const apiUrl = new URL("web/collection/articleList", apiArticleRootUrl).href;
	const currentUrl = new URL(`collection/${id}.html`, rootUrl).href;
	const { data: response } = await got_default.post(apiUrl, { form: {
		platform: "www",
		collection_id: id
	} });
	return {
		item: await processItems(response.data.datalist, limit),
		...await fetchApiRouteData({
			currentUrl,
			apiUrl: new URL("web/collection/detail", apiArticleRootUrl).href,
			form: {
				platform: "www",
				collection_id: id
			},
			mapData: (data) => ({
				title: data.name,
				description: data.summary,
				image: data.head_img || (data.icon ? new URL(data.icon, rootUrl).href : void 0),
				titlePrefix: buildHuxiuRouteTitlePrefix(route.name)
			})
		})
	};
}
//#endregion
export { route };
