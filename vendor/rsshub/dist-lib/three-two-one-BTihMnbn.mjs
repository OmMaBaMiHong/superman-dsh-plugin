import "./types-DNj6Etbg.mjs";
import { n as processItem, r as rootUrl, t as fetchContent } from "./utils-CrtzwAne.mjs";
//#region lib/routes/jamesclear/three-two-one.ts
const route = {
	path: "/3-2-1",
	view: 0,
	categories: ["blog"],
	example: "/jamesclear/3-2-1",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["jamesclear.com/3-2-1"],
		target: "/3-2-1"
	}],
	name: "3-2-1 Newsletter",
	maintainers: ["Rjnishant530"],
	handler
};
async function handler() {
	const items = (await fetchContent("3-2-1")).map((item) => processItem(item));
	return {
		title: "James Clear - 3-2-1 Newsletter",
		description: "3 ideas, 2 quotes, and 1 question to consider each week",
		link: `${rootUrl}/3-2-1`,
		item: items,
		language: "en",
		image: `${rootUrl}/wp-content/uploads/2021/04/3-2-1-Featured-Image.png`,
		icon: `${rootUrl}/favicon.ico`
	};
}
//#endregion
export { route };
