import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseItems } from "./parser-r2eHm_MD.mjs";
import { load } from "cheerio";
//#region lib/routes/collabo-cafe/tag.ts
const handler = async (ctx) => {
	const { tag } = ctx.req.param();
	const baseUrl = `https://collabo-cafe.com/events/tag/${tag}`;
	return {
		title: "标签",
		link: baseUrl,
		item: parseItems(load(await rofetch(baseUrl)))
	};
};
const route = {
	path: "/tag/:tag",
	categories: ["anime"],
	example: "/collabo-cafe/tag/ikebukuro",
	parameters: { tag: "Tag, refer to the original website (開催地域別)" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "标签",
	maintainers: ["cokemine"],
	handler
};
//#endregion
export { handler, route };
