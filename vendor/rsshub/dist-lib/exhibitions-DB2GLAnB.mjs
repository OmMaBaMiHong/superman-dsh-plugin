import { t as buildData } from "./common-config-072DXp-h.mjs";
//#region lib/routes/jewishmuseum/exhibitions.ts
const route = {
	path: "/exhibitions",
	categories: ["travel"],
	example: "/jewishmuseum/exhibitions",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Exhibitions",
	maintainers: ["chazeon"],
	handler
};
async function handler() {
	const link = "https://thejewishmuseum.org/exhibitions";
	return await buildData({
		link,
		url: link,
		title: "Jewish Museums - Exhibitions",
		item: {
			item: "#current article.exhibition, #upcoming article, #past article.exhibition",
			title: `$('h3').text()`,
			link: `$('h3').parent().attr('href')`
		}
	});
}
//#endregion
export { route };
