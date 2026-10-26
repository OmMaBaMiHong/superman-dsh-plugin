import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { n as playwrightGet, t as baseURL } from "./utils-CZLHN00Y.mjs";
import { load } from "cheerio";
//#region lib/routes/alternativeto/platform.ts
const route = {
	path: "/platform/:name/:routeParams?",
	categories: ["programming"],
	example: "/alternativeto/platform/firefox",
	parameters: {
		name: "Platform name",
		routeParams: "Filters of software type"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: true,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["www.alternativeto.net/platform/:name"],
		target: "/platform/:name"
	}],
	name: "Platform Software",
	maintainers: ["JimenezLi"],
	handler,
	description: "> routeParms can be copied from original site URL, example: `/alternativeto/platform/firefox/license=free`"
};
async function handler(ctx) {
	const link = `https://alternativeto.net/platform/${ctx.req.param("name")}/?${new URLSearchParams(ctx.req.param("routeParams")).toString()}`;
	const $ = load(await playwrightGet(link, cache_default));
	return {
		title: $(".Heading_h1___Cf5Y").text().trim(),
		description: $(".intro-text").text().trim(),
		link,
		item: $(".AppListItem_appInfo__h9cWP").toArray().map((element) => {
			const item = $(element);
			return {
				title: item.find(".Heading_h2___LwQD").text().trim(),
				link: `${baseURL}${item.find(".Heading_h2___LwQD a").attr("href")}`,
				description: item.find(".AppListItem_description__wtODK").text().trim()
			};
		})
	};
}
//#endregion
export { route };
