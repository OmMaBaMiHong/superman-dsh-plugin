import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { n as parseItem, r as parsePost, t as baseUrl } from "./utils-Dw9P-85q.mjs";
//#region lib/routes/tfc-taiwan/index.ts
const handler = async (ctx) => {
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : void 0;
	const pageResponse = await rofetch(`${baseUrl}/wp-json/wp/v2/pages/89173`);
	const postsResponse = await parsePost(limit, void 0);
	const pageInfo = pageResponse.yoast_head_json;
	const items = parseItem(postsResponse);
	return {
		title: pageInfo.title,
		description: pageInfo.og_site_name,
		image: pageInfo.og_image[0].url,
		logo: pageInfo.og_image[0].url,
		icon: pageInfo.og_image[0].url,
		link: pageInfo.canonical,
		lang: "zh-TW",
		item: items
	};
};
const route = {
	name: "最新查核報告",
	maintainers: ["TonyRL"],
	example: "/tfc-taiwan",
	path: "/",
	handler,
	url: "tfc-taiwan.org.tw/latest-news/"
};
//#endregion
export { route };
