import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/metmuseum/exhibitions.ts
function generateExhibitionItem(result) {
	return {
		title: result.title,
		link: `https://www.metmuseum.org${result.url}`,
		description: result.description,
		pubDate: parseDate(result.startDate),
		guid: result.id
	};
}
const route = {
	path: "/exhibitions/:state?",
	name: "Unknown",
	maintainers: [],
	handler
};
async function handler(ctx) {
	return {
		title: "The Metropolitan Museum of Art - Exhibitions",
		link: "https://www.metmuseum.org/exhibitions",
		item: (await got_default({
			url: `https://www.metmuseum.org/ghidorah/ExhibitionListing/Search?searchType=${ctx.req.param("state") ?? "current"}`,
			method: "GET"
		})).data.data.results.map((element) => generateExhibitionItem(element))
	};
}
//#endregion
export { route };
