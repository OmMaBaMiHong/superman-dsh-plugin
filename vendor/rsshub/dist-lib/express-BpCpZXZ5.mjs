import "./types-DNj6Etbg.mjs";
import { n as getNewsflashItems, r as rootUrl } from "./utils-DwjCAZMf2.mjs";
//#region lib/routes/techflowpost/express.ts
const route = {
	path: "/express",
	categories: ["finance"],
	view: 0,
	example: "/techflowpost/express",
	radar: [{ source: ["techflowpost.com/zh-CN/newsletter"] }],
	name: "快讯",
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
	url: "techflowpost.com/zh-CN/newsletter"
};
async function handler(ctx) {
	return {
		title: "深潮TechFlow - 快讯",
		link: `${rootUrl}/zh-CN/newsletter`,
		item: await getNewsflashItems(ctx.req.query("limit") ?? 50)
	};
}
//#endregion
export { route };
