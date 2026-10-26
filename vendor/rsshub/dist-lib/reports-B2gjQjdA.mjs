import "./types-DNj6Etbg.mjs";
import { t as fetchCollection } from "./utils-BFxSe69v.mjs";
//#region lib/routes/newslaundry/reports.ts
const route = {
	path: "/reports",
	view: 0,
	categories: ["new-media"],
	example: "/newslaundry/reports",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["newslaundry.com/reports"],
		target: "/reports"
	}],
	name: "Reports",
	maintainers: ["Rjnishant530"],
	handler
};
async function handler() {
	return await fetchCollection("reports", void 0, true);
}
//#endregion
export { route };
