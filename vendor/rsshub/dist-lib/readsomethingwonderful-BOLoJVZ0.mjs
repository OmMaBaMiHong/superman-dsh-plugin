import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/readsomethingwonderful/index.ts
const route = {
	path: "/",
	name: "Articles",
	categories: ["blog"],
	example: "/readsomethingwonderful",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["readsomethingwonderful.com/"] }],
	maintainers: ["ttttmr"],
	handler
};
async function handler() {
	const { data: response } = await got_default("https://api.getmatter.com/tools/api/rsw_entries/?format=json");
	return {
		title: "Read Something Wonderful",
		link: "https://readsomethingwonderful.com/",
		item: response.results.map((item) => ({
			title: item.title,
			link: item.url,
			pubDate: parseDate(item.publication_date),
			author: item.author_name,
			description: `
            ${item.recommender_name ? `<p>Recommended by: ${item.recommender_name}</p>` : ""}
            ${item.screenshot ? `<img src="${item.screenshot}" alt="Screenshot - ${item.title}">` : ""}
        `
		}))
	};
}
//#endregion
export { route };
