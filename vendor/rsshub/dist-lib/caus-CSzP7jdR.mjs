import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
//#region lib/routes/caus/index.ts
const categories = {
	0: {
		title: "全部",
		slug: "",
		id: 0
	},
	1: {
		title: "要闻",
		slug: "news",
		id: 101
	},
	2: {
		title: "商业",
		slug: "finance",
		id: 108
	},
	3: {
		title: "快讯",
		slug: "lifestyle",
		id: 106
	},
	8: {
		title: "财富",
		slug: "finance",
		id: 108
	},
	6: {
		title: "生活",
		slug: "lifestyle",
		id: 106
	}
};
const route = {
	path: "/:category?",
	categories: ["new-media"],
	example: "/caus",
	parameters: { category: "分类，见下表，默认为全部" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "分类",
	maintainers: ["nczitzk", "pseudoyu"],
	handler,
	description: `| 全部 | 要闻 | 商业 | 快讯 | 财富 | 生活 |
| ---- | ---- | ---- | ---- | ---- | ---- |
| 0    | 1    | 2    | 3    | 8    | 6    |`
};
async function handler(ctx) {
	const category = ctx.req.param("category") || "0";
	const cat = categories[category] || categories[0];
	const rootUrl = "https://caus.com";
	const apiUrl = `${rootUrl}/wp-json/wp/v2/posts`;
	const query = {
		per_page: 20,
		_embed: "author,wp:term"
	};
	if (cat.id) query.categories = cat.id;
	const items = (await rofetch(apiUrl, { query })).map((item) => ({
		title: item.title.rendered,
		link: item.link,
		description: item.content.rendered,
		pubDate: parseDate(item.date_gmt),
		author: item._embedded?.author?.[0]?.name,
		category: item._embedded?.["wp:term"]?.[0]?.map((t) => t.name)
	}));
	const currentUrl = cat.slug ? `${rootUrl}/category/${cat.slug}/` : rootUrl;
	return {
		title: `${cat.title} - 加美财经`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
