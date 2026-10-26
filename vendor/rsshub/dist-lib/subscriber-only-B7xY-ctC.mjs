import "./types-DNj6Etbg.mjs";
import { t as fetchCollection } from "./utils-BFxSe69v.mjs";
//#region lib/routes/newslaundry/subscriber-only.ts
const route = {
	path: "/subscriber-only",
	view: 0,
	categories: ["new-media"],
	example: "/newslaundry/subscriber-only",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["newslaundry.com/subscriber-only"],
		target: "/subscriber-only"
	}],
	name: "Subscriber Only",
	maintainers: ["Rjnishant530"],
	handler
};
async function handler() {
	return await fetchCollection("subscriber-only");
}
//#endregion
export { route };
