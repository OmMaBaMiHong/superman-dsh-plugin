import "./types-DNj6Etbg.mjs";
import { n as fetchNewsItems, r as fetchTag } from "./utils-Yq8QbnKj.mjs";
//#region lib/routes/iplaysoft/tag.ts
const handler = async (ctx) => {
	const slug = ctx.req.param("slug");
	const { id, name } = await fetchTag(slug);
	const rootUrl = "https://www.iplaysoft.com/";
	const items = await fetchNewsItems(`${rootUrl}wp-json/wp/v2/posts?_embed&tags=${id}`);
	return {
		title: `${name} - 异次元软件世界`,
		description: "软件改变生活",
		language: "zh-CN",
		link: `${rootUrl}tag/${slug}`,
		item: items
	};
};
const route = {
	path: "/tag/:slug",
	name: "标签",
	url: "www.iplaysoft.com",
	maintainers: ["cscnk52"],
	handler,
	example: "/iplaysoft/tag/windows",
	parameters: { slug: "标签名称" },
	description: void 0,
	categories: ["program-update"],
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
		source: ["www.iplaysoft.com/tag/:slug"],
		target: "/tag/:slug"
	}],
	view: 0
};
//#endregion
export { handler, route };
