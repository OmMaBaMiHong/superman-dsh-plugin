import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as getItems } from "./items-processor-Xam83oUy.mjs";
import { load } from "cheerio";
//#region lib/routes/publico/public.ts
const route = {
	path: "/public",
	categories: ["traditional-media"],
	example: "/publico/public",
	features: {
		requireConfig: false,
		requirePuppeteer: true,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["publico.es/public"],
		target: "/public"
	}],
	name: "Public",
	maintainers: ["adrianrico97"],
	handler
};
async function handler() {
	const currentUrl = `https://www.publico.es/public`;
	return {
		title: "public | Público",
		link: currentUrl,
		item: getItems(load((await got_default({
			method: "get",
			url: currentUrl
		})).data))
	};
}
//#endregion
export { route };
