import { t as got_default } from "./got-Dnzt41dd.mjs";
import { c as fetchApiRouteData, d as processItems, f as rootUrl, n as apiClubRootUrl, s as buildHuxiuRouteTitlePrefix } from "./util-CislQG2a.mjs";
//#region lib/routes/huxiu/club.ts
const route = {
	path: "/club/:id",
	name: "源流",
	categories: ["new-media"],
	example: "/huxiu/club/1161",
	parameters: { id: "源流 id，可在对应源流页 URL 中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: true,
		supportScihub: false
	},
	maintainers: ["nczitzk", "TimoYoung"],
	handler,
	description: "更多源流请参见 [源流](https://www.huxiu.com/club)"
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 20;
	const apiUrl = new URL("v1/club/briefList", apiClubRootUrl).href;
	const currentUrl = new URL(`club/${id}.html`, rootUrl).href;
	const data = await fetchApiRouteData({
		currentUrl,
		apiUrl: new URL("v1/club/detail", apiClubRootUrl).href,
		form: {
			platform: "www",
			club_id: id
		},
		mapData: (data) => ({
			title: data.name,
			description: data.format_desc ?? data.share_info?.share_desc,
			image: data.icon_path ?? data.share_info?.share_img,
			titlePrefix: buildHuxiuRouteTitlePrefix(route.name)
		})
	});
	const { data: response } = await got_default.post(apiUrl, { form: {
		platform: "www",
		club_id: id,
		pagesize: limit
	} });
	return {
		item: await processItems(response.data.datalist, limit),
		...data
	};
}
//#endregion
export { route };
