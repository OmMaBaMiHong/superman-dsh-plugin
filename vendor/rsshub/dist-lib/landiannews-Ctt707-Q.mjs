import "./types-DNj6Etbg.mjs";
import { n as fetchNewsItems } from "./utils-VWbHc1Vi.mjs";
//#region lib/routes/landiannews/index.ts
const handler = async () => {
	const rootUrl = "https://www.landiannews.com/";
	return {
		title: "蓝点网",
		description: "给你感兴趣的内容!",
		link: rootUrl,
		item: await fetchNewsItems(`${rootUrl}wp-json/wp/v2/posts?_embed=author,wp:term`)
	};
};
const route = {
	path: "/",
	name: "首页",
	url: "www.landiannews.com",
	maintainers: ["nczitzk", "cscnk52"],
	handler,
	example: "/landiannews",
	parameters: void 0,
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
		source: ["www.landiannews.com"],
		target: "/"
	}],
	view: 0
};
//#endregion
export { handler, route };
