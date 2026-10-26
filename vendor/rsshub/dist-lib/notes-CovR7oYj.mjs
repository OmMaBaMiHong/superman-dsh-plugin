import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as getItem } from "./utils-C3za0lgw.mjs";
//#region lib/routes/crossbell/notes/index.ts
const route = {
	path: "/notes",
	categories: ["social-media"],
	example: "/crossbell/notes",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["crossbell.io/*"] }],
	name: "Notes",
	maintainers: ["DIYgod"],
	handler,
	url: "crossbell.io/*"
};
async function handler() {
	return {
		title: "Crossbell Notes",
		link: "https://crossbell.io/",
		item: (await got_default("https://indexer.crossbell.io/v1/notes", { searchParams: { includeCharacter: true } })).data?.list?.map((item) => getItem(item))
	};
}
//#endregion
export { route };
