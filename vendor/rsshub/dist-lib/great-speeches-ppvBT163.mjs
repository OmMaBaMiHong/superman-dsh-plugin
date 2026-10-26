import "./types-DNj6Etbg.mjs";
import { n as processItem, r as rootUrl, t as fetchContent } from "./utils-CrtzwAne.mjs";
//#region lib/routes/jamesclear/great-speeches.ts
const route = {
	path: "/great-speeches",
	view: 0,
	categories: ["blog"],
	example: "/jamesclear/great-speeches",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["jamesclear.com/great-speeches"],
		target: "/great-speeches"
	}],
	name: "Great Speeches",
	maintainers: ["Rjnishant530"],
	handler
};
async function handler() {
	const items = (await fetchContent("great-speeches")).map((item) => processItem(item));
	return {
		title: "James Clear - Great Speeches",
		description: "Collection of great speeches curated by James Clear",
		link: `${rootUrl}/great-speeches`,
		item: items,
		language: "en",
		icon: `${rootUrl}/favicon.ico`
	};
}
//#endregion
export { route };
