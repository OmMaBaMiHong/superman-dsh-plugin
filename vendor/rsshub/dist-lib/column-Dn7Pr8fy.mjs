import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
//#region lib/routes/tencent/cloud/developer/column.ts
const PAGE = 1;
const PAGE_SIZE = 20;
const route = {
	path: "/cloud/developer/column/:categoryId?",
	categories: ["programming"],
	example: "/tencent/cloud/developer/column/1",
	parameters: { categoryId: "categoryId from page url" },
	radar: [{ source: ["cloud.tencent.com/developer/column"] }],
	name: "腾讯云开发者社区专栏",
	maintainers: ["lyling"],
	handler: async (ctx) => {
		const categoryId = ctx.req.param("categoryId") ?? 0;
		const items = (await rofetch("https://cloud.tencent.com/developer/api/home/article-list", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: {
				classifyId: categoryId,
				page: PAGE,
				pagesize: PAGE_SIZE,
				type: ""
			}
		})).list.map((item) => ({
			title: item.title,
			link: `https://cloud.tencent.com/developer/article/${item.articleId}`,
			description: item.summary,
			pubDate: parseDate(item.createTime * 1e3),
			author: item.author.nickname,
			category: item.tags.map((tag) => tag.tagName)
		}));
		const classify = await findClassifyById(categoryId);
		const title = classify ? classify.name : "";
		return {
			title,
			description: `${title} - 腾讯云开发者社区`,
			item: items
		};
	}
};
async function findClassifyById(id) {
	const classifylink = "https://cloud.tencent.com/developer/api/column/get-classify-list-by-scene";
	return (await cache_default.tryGet(classifylink, async () => {
		return await rofetch(classifylink, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: { scene: 0 }
		});
	})).list.find((classify) => classify.id === Number(id));
}
//#endregion
export { route };
