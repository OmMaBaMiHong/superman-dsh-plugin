import { t as got_default } from "./got-Dnzt41dd.mjs";
import { c as fetchApiRouteData, d as processItems, f as rootUrl, s as buildHuxiuRouteTitlePrefix, t as apiArticleRootUrl } from "./util-CislQG2a.mjs";
//#region lib/routes/huxiu/tag.ts
const route = {
	path: "/tag/:id",
	categories: ["new-media"],
	example: "/huxiu/tag/291",
	parameters: { id: "标签 id，可在对应标签页 URL 中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: true,
		supportScihub: false
	},
	name: "标签",
	maintainers: [
		"xyqfer",
		"HenryQW",
		"nczitzk",
		"TimoYoung"
	],
	handler,
	description: "更多标签请参见 [标签](https://www.huxiu.com/tags)"
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 10;
	const apiUrl = new URL("/v3/tag/articleList", apiArticleRootUrl).href;
	const currentUrl = new URL(`tag/${id}.html`, rootUrl).href;
	const { data: response } = await got_default.post(apiUrl, { form: {
		platform: "www",
		tag_id: id
	} });
	return {
		item: await processItems(response.data.datalist, limit),
		...await fetchApiRouteData({
			currentUrl,
			apiUrl: new URL("v3/tag/detail", apiArticleRootUrl).href,
			form: {
				platform: "www",
				tag_id: id
			},
			mapData: (data) => ({
				title: data.tag_name,
				description: data.summary ?? data.share_info?.share_desc,
				image: data.pic_path ?? data.share_info?.share_img,
				titlePrefix: buildHuxiuRouteTitlePrefix(route.name)
			})
		})
	};
}
//#endregion
export { route };
