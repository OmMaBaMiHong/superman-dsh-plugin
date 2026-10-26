import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as getItem } from "./utils-C3za0lgw.mjs";
//#region lib/routes/crossbell/notes/source.ts
const route = {
	path: "/notes/source/:source",
	categories: ["social-media"],
	example: "/crossbell/notes/source/xlog",
	parameters: { source: "N" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["crossbell.io/*"],
		target: "/notes"
	}],
	name: "Notes of source",
	maintainers: ["DIYgod"],
	handler,
	url: "crossbell.io/*"
};
async function handler(ctx) {
	const source = ctx.req.param("source");
	const response = await got_default("https://indexer.crossbell.io/v1/notes", { searchParams: {
		sources: source,
		includeCharacter: true
	} });
	return {
		title: "Crossbell Notes from " + source,
		link: "https://crossbell.io/",
		item: response.data?.list?.map((item) => getItem(item))
	};
}
//#endregion
export { route };
