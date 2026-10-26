import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { n as parseItem, r as parsePost, t as baseUrl } from "./utils-Dw9P-85q.mjs";
//#region lib/routes/tfc-taiwan/category.ts
const handler = async (ctx) => {
	const { category } = ctx.req.param();
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : void 0;
	const isNumericCategory = !Number.isNaN(Number(category));
	const categoryResponse = await rofetch(`${baseUrl}/wp-json/wp/v2/categories${isNumericCategory ? `/${category}` : ""}`, { query: { slug: isNumericCategory ? void 0 : category } });
	if (Array.isArray(categoryResponse) && !categoryResponse.length) throw new InvalidParameterError(`Category "${category}" not found`);
	const categoryInfo = isNumericCategory ? categoryResponse : categoryResponse[0];
	if (!categoryInfo.id) throw new InvalidParameterError(`Category "${category}" not found`);
	const items = parseItem(await parsePost(limit, categoryInfo.id));
	return {
		title: categoryInfo.yoast_head_json.title,
		description: categoryInfo.yoast_head_json.og_site_name,
		image: categoryInfo.yoast_head_json.og_image[0].url,
		logo: categoryInfo.yoast_head_json.og_image[0].url,
		icon: categoryInfo.yoast_head_json.og_image[0].url,
		link: categoryInfo.link,
		lang: "zh-TW",
		item: items
	};
};
const route = {
	name: "分類",
	maintainers: ["TonyRL"],
	example: "/tfc-taiwan/category/weekly-top-ten-rumors",
	path: "/category/:category",
	parameters: { category: "分類，見下表，預設為 `weekly-top-ten-rumors`" },
	handler,
	url: "tfc-taiwan.org.tw/category/rumor-mill/",
	description: `| 謠言風向球 | 議題觀察室        | TOP10                 | 名家專欄       | 國際視野             |
| ---------- | ----------------- | --------------------- | -------------- | -------------------- |
| rumor-mill | issue-observatory | weekly-top-ten-rumors | expert-columns | research-and-updates |`
};
//#endregion
export { route };
