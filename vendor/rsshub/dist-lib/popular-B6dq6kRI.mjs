import "./types-DNj6Etbg.mjs";
import { n as processWithWp, r as rootUrl, t as extractMiniCards } from "./utils-BCk8K7LH.mjs";
//#region lib/routes/css-tricks/popular.ts
const route = {
	path: "/popular",
	view: 0,
	categories: ["programming"],
	example: "/css-tricks/popular",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["css-tricks.com"],
		target: "/popular"
	}],
	name: "Popular this month",
	maintainers: ["Rjnishant530"],
	handler
};
async function handler() {
	const { cards: popularCards } = await extractMiniCards("div.popular-articles > div.mini-card-grid article.mini-card.module.module-article");
	return {
		title: "Popular this month",
		description: "Popular CSS articles this month",
		link: rootUrl,
		item: await processWithWp(popularCards, true),
		language: "en",
		logo: `${rootUrl}/favicon.ico`,
		icon: `${rootUrl}/favicon.ico`
	};
}
//#endregion
export { route };
