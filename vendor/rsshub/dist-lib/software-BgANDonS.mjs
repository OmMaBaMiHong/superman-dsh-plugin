import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { n as playwrightGet, t as baseURL } from "./utils-CZLHN00Y.mjs";
import { load } from "cheerio";
//#region lib/routes/alternativeto/software.ts
const route = {
	path: "/software/:name/:routeParams?",
	categories: ["programming"],
	example: "/alternativeto/software/cpp",
	parameters: {
		name: "Software name",
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
		source: ["www.alternativeto.net/software/:name"],
		target: "/software/:name"
	}],
	name: "Software Alternatives",
	maintainers: ["JimenezLi"],
	handler,
	description: "> routeParms can be copied from original site URL, example: `/alternativeto/software/cpp/license=opensource&platform=windows`"
};
async function handler(ctx) {
	const link = `https://alternativeto.net/software/${ctx.req.param("name")}/?${new URLSearchParams(ctx.req.param("routeParams")).toString()}`;
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
