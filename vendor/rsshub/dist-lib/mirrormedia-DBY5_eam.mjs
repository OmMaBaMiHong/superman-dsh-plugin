import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as getArticle } from "./utils-DmDeW5rn.mjs";
//#region lib/routes/mirrormedia/index.ts
const route = {
	path: "/",
	categories: ["traditional-media"],
	example: "/mirrormedia",
	parameters: {},
	name: "首页",
	maintainers: ["dzx-dzx"],
	radar: [{ source: ["mirrormedia.mg"] }],
	handler
};
async function handler(ctx) {
	const rootUrl = "https://www.mirrormedia.mg";
	const response = await rofetch("https://v3-statics.mirrormedia.mg/files/json/post_external01.json");
	const items = [...response.choices.map((e) => ({
		__from: "choices",
		...e
	})), ...response.latest.map((e) => ({
		__from: "latest",
		...e
	}))].map((e) => ({
		title: e.title,
		pubDate: parseDate(e.publishedDate),
		category: [...(e.sections ?? []).map((_) => _.name), e.__from],
		link: `${rootUrl}/${e.style === "" ? "external" : "story"}/${e.slug}`
	})).slice(0, ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 20);
	return {
		title: "鏡週刊 Mirror Media",
		link: rootUrl,
		item: await Promise.all(items.map((item) => getArticle(item)))
	};
}
//#endregion
export { route };
