import "./types-DNj6Etbg.mjs";
import { n as rootUrl, t as fetchCollection } from "./utils-BFxSe69v.mjs";
//#region lib/routes/newslaundry/podcast.ts
const route = {
	path: "/podcast/:category?",
	view: 0,
	categories: ["new-media"],
	example: "/newslaundry/podcast",
	parameters: { category: "Podcast category, see below for details" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: true,
		supportScihub: false
	},
	radar: [
		{
			source: ["newslaundry.com/podcast"],
			target: "/podcast"
		},
		{
			source: ["newslaundry.com/collection/nl-hafta-podcast"],
			target: "/podcast/nl-hafta"
		},
		{
			source: ["newslaundry.com/podcast/whats-your-ism"],
			target: "/podcast/whats-your-ism"
		}
	],
	name: "Podcast",
	description: `| Category         | URL                                                                              |
| ---------------- | -------------------------------------------------------------------------------- |
| All Podcasts     | [/podcast](https://rsshub.app/newslaundry/podcast)                               |
| NL Hafta         | [/podcast/nl-hafta](https://rsshub.app/newslaundry/podcast/nl-hafta)             |
| What's Your Ism? | [/podcast/whats-your-ism](https://rsshub.app/newslaundry/podcast/whats-your-ism) |`,
	maintainers: ["Rjnishant530"],
	handler
};
async function handler(ctx) {
	const category = ctx.req.param("category");
	const categoryMap = {
		"nl-hafta": {
			slug: "nl-hafta-podcast",
			url: `${rootUrl}/collection/nl-hafta-podcast`
		},
		"whats-your-ism": {
			slug: "whats-your-ism-podcast-newslaundry-hindi",
			url: `${rootUrl}/podcast/whats-your-ism`
		}
	};
	const skipFirstItem = !category;
	return category && Object.hasOwn(categoryMap, category) ? await fetchCollection(categoryMap[category].slug, categoryMap[category].url) : await fetchCollection("podcast", void 0, skipFirstItem);
}
//#endregion
export { route };
