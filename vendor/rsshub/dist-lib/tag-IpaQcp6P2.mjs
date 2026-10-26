import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { a as namespace, i as processItems, n as baseUrl, r as parseList, t as apiBaseUrl } from "./utils-CiQT4CFr.mjs";
//#region lib/routes/foodtalks/tag.ts
const route = {
	path: "/news/tag/:tagId",
	parameters: { tagId: "标签 ID" },
	categories: namespace.categories,
	example: "/foodtalks/news/tag/13335",
	radar: [{ source: ["www.foodtalks.cn/news/tag/:tagId"] }],
	name: "标签",
	maintainers: ["TonyRL"],
	handler,
	url: "www.foodtalks.cn"
};
const getTagName = async (tagId) => {
	const response = await rofetch(`${apiBaseUrl}/basic/tag/${tagId}?language=ZH`, { headers: { referer: `${baseUrl}/` } });
	if (!response.data) throw new Error("Invalid tagId");
	return response.data.name;
};
async function handler(ctx) {
	const { tagId } = ctx.req.param();
	const limit = Number(ctx.req.query("limit")) || 15;
	const response = await rofetch(`${apiBaseUrl}/news/news/page`, {
		headers: { referer: `${baseUrl}/` },
		query: {
			current: 1,
			size: limit,
			tagId,
			language: "ZH"
		}
	});
	const tagName = await getTagName(tagId);
	const items = await processItems(parseList(response.data.records));
	return {
		title: `“${tagName}” 相关资讯-${namespace.name}`,
		description: namespace.description,
		link: `${baseUrl}/news/tag/${tagId}`,
		item: items,
		image: `${baseUrl}/favicon.ico`
	};
}
//#endregion
export { route };
