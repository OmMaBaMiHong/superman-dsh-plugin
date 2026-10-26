import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { n as signHeaders, r as zfcgBaseUrl, t as getCategories } from "./utils-DxKTtH0j.mjs";
import { load } from "cheerio";
//#region lib/routes/gov/zj/czt/zfcg.ts
const route = {
	path: "/zfcg/:code?",
	categories: ["government"],
	example: "/gov/zj/zfcg/110-606633",
	parameters: { code: "分类代码，默认为 110-600268（采购意向公开）" },
	name: "政府采购公告",
	maintainers: ["TonyRL"],
	handler,
	url: "zfcg.czt.zj.gov.cn"
};
async function handler(ctx) {
	const { code = "110-600268" } = ctx.req.param();
	const limit = Number(ctx.req.query("limit")) || 15;
	const name = (await getCategories()).find((category) => category.code === code)?.name ?? code;
	const path = "/portal/category";
	const body = JSON.stringify({
		pageNo: 1,
		pageSize: limit,
		categoryCode: code,
		isGov: true,
		excludeDistrictPrefix: [
			"90",
			"006011",
			"H0",
			"001111"
		],
		_t: Date.now()
	});
	const { result } = await rofetch(`${zfcgBaseUrl}${path}`, {
		method: "POST",
		headers: signHeaders("POST", path, body),
		body
	});
	const list = result.data.data.map((article) => ({
		title: article.title,
		link: `${zfcgBaseUrl}/site/detail?categoryCode=${code}&articleId=${encodeURIComponent(article.articleId)}`,
		pubDate: parseDate(article.publishDate),
		category: article.pathName,
		author: article.author,
		articleId: article.articleId
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const path = `/portal/detail?articleId=${encodeURIComponent(item.articleId)}&timestamp=${Math.floor(Date.now() / 1e3)}`;
		const { result } = await rofetch(`${zfcgBaseUrl}${path}`, { headers: signHeaders("GET", path) });
		const data = result.data;
		const $ = load(data.content, null, false);
		$(".ann-block [class], .ann-block [style]").removeAttr("class").removeAttr("style");
		return {
			...item,
			description: $(".ann-block").html() ?? "",
			category: [.../* @__PURE__ */ new Set([
				item.category,
				data.projectName,
				...data.categoryNames
			])]
		};
	})));
	return {
		title: `浙江政府采购网 - ${name}`,
		link: `${zfcgBaseUrl}/site/category?parentId=600007&childrenCode=${code}`,
		item: items
	};
}
//#endregion
export { route };
