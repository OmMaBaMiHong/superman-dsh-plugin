import "./types-DNj6Etbg.mjs";
import { n as processItem, r as rootUrl, t as fetchContent } from "./utils-CrtzwAne.mjs";
//#region lib/routes/jamesclear/book-summaries.ts
const route = {
	path: "/book-summaries",
	view: 0,
	categories: ["blog"],
	example: "/jamesclear/book-summaries",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["jamesclear.com/book-summaries"],
		target: "/book-summaries"
	}],
	name: "Book Summaries",
	maintainers: ["Rjnishant530"],
	handler
};
async function handler() {
	const items = (await fetchContent("book-summaries")).map((item) => processItem(item));
	return {
		title: "James Clear - Book Summaries",
		description: "Book summaries by James Clear",
		link: `${rootUrl}/book-summaries`,
		item: items,
		language: "en",
		icon: `${rootUrl}/favicon.ico`
	};
}
//#endregion
export { route };
