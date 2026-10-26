import "./types-DNj6Etbg.mjs";
import { n as rootUrl, t as fetchCollection } from "./utils-BFxSe69v.mjs";
//#region lib/routes/newslaundry/explainer.ts
const route = {
	path: "/explainer",
	view: 0,
	categories: ["new-media"],
	example: "/newslaundry/explainer",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["newslaundry.com/explainer"],
		target: "/explainer"
	}],
	name: "Explainer",
	maintainers: ["Rjnishant530"],
	handler
};
async function handler() {
	return await fetchCollection("explainer", `${rootUrl}/explainer`);
}
//#endregion
export { route };
