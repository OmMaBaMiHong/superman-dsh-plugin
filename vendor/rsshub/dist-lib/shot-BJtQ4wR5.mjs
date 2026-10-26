import "./types-DNj6Etbg.mjs";
import { t as fetchCollection } from "./utils-BFxSe69v.mjs";
//#region lib/routes/newslaundry/shot.ts
const route = {
	path: "/shot",
	view: 0,
	categories: ["new-media"],
	example: "/newslaundry/shot",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["newslaundry.com/shot"],
		target: "/shot"
	}],
	name: "Shot",
	maintainers: ["Rjnishant530"],
	handler
};
async function handler() {
	return await fetchCollection("shot");
}
//#endregion
export { route };
