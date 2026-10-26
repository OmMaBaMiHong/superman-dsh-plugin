import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { n as processWithWp } from "./utils-BCk8K7LH.mjs";
import { load } from "cheerio";
//#region lib/routes/css-tricks/articles.ts
const route = {
	path: "/articles",
	view: 0,
	categories: ["programming"],
	example: "/css-tricks/articles",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["css-tricks.com/category/articles/"],
		target: "/articles"
	}],
	name: "Articles",
	maintainers: ["Rjnishant530"],
	handler
};
async function handler() {
	const rootUrl = "https://css-tricks.com";
	const currentUrl = `${rootUrl}/category/articles/`;
	return {
		title: "Articles - CSS-Tricks",
		description: "Latest Articles - CSS-Tricks",
		link: currentUrl,
		item: await processWithWp(load(await rofetch(currentUrl))("article.article-card").toArray()),
		language: "en",
		logo: `${rootUrl}/favicon.ico`,
		icon: `${rootUrl}/favicon.ico`
	};
}
//#endregion
export { route };
