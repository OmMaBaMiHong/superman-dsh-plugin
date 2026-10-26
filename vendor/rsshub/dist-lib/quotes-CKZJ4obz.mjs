import "./types-DNj6Etbg.mjs";
import { n as processItem, r as rootUrl, t as fetchContent } from "./utils-CrtzwAne.mjs";
//#region lib/routes/jamesclear/quotes.ts
const route = {
	path: "/quotes",
	view: 0,
	categories: ["blog"],
	example: "/jamesclear/quotes",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["jamesclear.com/quotes"],
		target: "/quotes"
	}],
	name: "Quotes",
	maintainers: ["Rjnishant530"],
	handler
};
async function handler() {
	const items = (await fetchContent("quotes")).map((item) => processItem(item));
	return {
		title: "James Clear - Quotes",
		description: "Quotes from James Clear",
		link: `${rootUrl}/quotes`,
		item: items,
		language: "en",
		icon: `${rootUrl}/favicon.ico`
	};
}
//#endregion
export { route };
