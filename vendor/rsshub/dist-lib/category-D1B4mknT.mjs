import "./types-DNj6Etbg.mjs";
import { n as fetchNewsItems, t as fetchCategory } from "./utils-VWbHc1Vi.mjs";
//#region lib/routes/landiannews/category.ts
const handler = async (ctx) => {
	const slug = ctx.req.param("slug");
	const { id, name } = await fetchCategory(slug);
	const rootUrl = "https://www.landiannews.com/";
	const items = await fetchNewsItems(`${rootUrl}wp-json/wp/v2/posts?_embed=author,wp:term&categories=${id}`);
	return {
		title: `${name} - 蓝点网`,
		description: "给你感兴趣的内容!",
		link: `${rootUrl}${slug}`,
		item: items
	};
};
const route = {
	path: "/category/:slug",
	name: "分类",
	url: "www.landiannews.com",
	maintainers: ["cscnk52"],
	handler,
	example: "/landiannews/category/sells",
	parameters: { slug: "分类名称" },
	description: void 0,
	categories: ["new-media"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportRadar: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["www.landiannews.com/:slug"],
		target: "/category/:slug"
	}],
	view: 0
};
//#endregion
export { handler, route };
