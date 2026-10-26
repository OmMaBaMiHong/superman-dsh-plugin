import "./types-DNj6Etbg.mjs";
import { r as rootUrl, t as getArticleItems } from "./utils-DwjCAZMf2.mjs";
//#region lib/routes/techflowpost/index.ts
const route = {
	path: "/",
	example: "/techflowpost",
	radar: [{ source: ["techflowpost.com/zh-CN"] }],
	name: "首页",
	categories: ["finance"],
	view: 0,
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	maintainers: ["nczitzk"],
	handler,
	url: "techflowpost.com/zh-CN"
};
async function handler(ctx) {
	const items = await getArticleItems({ limit: ctx.req.query("limit") ?? 50 });
	return {
		title: "深潮TechFlow",
		link: `${rootUrl}/zh-CN`,
		item: items
	};
}
//#endregion
export { route };
