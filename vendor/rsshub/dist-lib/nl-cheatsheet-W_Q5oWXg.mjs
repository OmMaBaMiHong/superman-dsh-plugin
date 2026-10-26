import "./types-DNj6Etbg.mjs";
import { n as rootUrl, t as fetchCollection } from "./utils-BFxSe69v.mjs";
//#region lib/routes/newslaundry/nl-cheatsheet.ts
const route = {
	path: "/nl-cheatsheet",
	view: 0,
	categories: ["new-media"],
	example: "/newslaundry/nl-cheatsheet",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["newslaundry.com/collection/nl-cheatsheet"],
		target: "/nl-cheatsheet"
	}],
	name: "Explains",
	maintainers: ["Rjnishant530"],
	handler
};
async function handler() {
	return await fetchCollection("nl-cheatsheet", `${rootUrl}/collection/nl-cheatsheet`);
}
//#endregion
export { route };
