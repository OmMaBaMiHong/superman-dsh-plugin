import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as getItems } from "./items-processor-Xam83oUy.mjs";
import { load } from "cheerio";
//#region lib/routes/publico/tremending.ts
const route = {
	path: "/tremending",
	categories: ["traditional-media"],
	example: "/publico/tremending",
	features: {
		requireConfig: false,
		requirePuppeteer: true,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["publico.es/tremending"],
		target: "/tremending"
	}],
	name: "Tremending",
	maintainers: ["adrianrico97"],
	handler
};
async function handler() {
	const currentUrl = `https://www.publico.es/tremending`;
	return {
		title: "Tremending | Público",
		link: currentUrl,
		item: getItems(load((await got_default({
			method: "get",
			url: currentUrl
		})).data))
	};
}
//#endregion
export { route };
