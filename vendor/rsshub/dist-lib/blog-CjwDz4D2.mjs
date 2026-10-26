import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/qwen/blog.ts
const buildBlogItem = (item, base) => {
	const content = load(item.content || item.extra.introduction || "")(".post-content").html() ?? (item.extra.introduction || "");
	return {
		title: item.title,
		image: item.extra.cover_small,
		pubDate: parseDate(item.extra.date),
		author: item.extra.author,
		link: `${base}/blog?id=${item.path}`,
		description: content,
		category: item.extra.tags
	};
};
const route = {
	path: "/blog/:lang?",
	categories: ["programming"],
	example: "/qwen/blog",
	parameters: { lang: "语言，`zh-CN`, `en-US`" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Blog",
	maintainers: ["Kjasn"],
	handler: async (ctx) => {
		const base = "https://qwen.ai";
		const { lang = "zh-CN" } = ctx.req.param();
		const articles = (await rofetch(`${base}/api/v2/article/retrieval?language=${lang}&type=qwen_ai`)).data?.articles;
		return {
			title: "Qwen Blog",
			link: `${base}/research`,
			item: (articles || []).map((item) => buildBlogItem(item, base))
		};
	}
};
//#endregion
export { buildBlogItem, route };
