import "./types-DNj6Etbg.mjs";
import { n as rootUrl, t as fetchCollection } from "./utils-BFxSe69v.mjs";
//#region lib/routes/newslaundry/nl-collaborations.ts
const route = {
	path: "/nl-collaborations",
	view: 0,
	categories: ["new-media"],
	example: "/newslaundry/nl-collaborations",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["newslaundry.com/nl-collaborations"],
		target: "/nl-collaborations"
	}],
	name: "NL Collaboration",
	maintainers: ["Rjnishant530"],
	handler
};
async function handler() {
	return await fetchCollection("nl-collaborations", `${rootUrl}/nl-collaborations`);
}
//#endregion
export { route };
