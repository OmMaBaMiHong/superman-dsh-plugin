import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/tableau/viz-of-the-day.ts
const route = {
	path: "/viz-of-the-day",
	categories: ["study"],
	example: "/tableau/viz-of-the-day",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Viz of the day",
	maintainers: [],
	handler
};
async function handler() {
	const { data: response } = await got_default("https://public.tableau.com/api/gallery?page=0&count=20&galleryType=viz-of-the-day");
	return {
		title: "Tableau Viz of the Day",
		link: "https://public.tableau.com/app/discover/viz-of-the-day",
		image: "https://help.tableau.com/current/pro/desktop/en-us/Resources/tableau-logo.png",
		item: response.items.map((item) => ({
			title: item.title,
			link: item.sourceUrl,
			pubDate: parseDate(item.galleryItemPublicationDate),
			author: item.authorName,
			description: `<div><p>${item.description}</p><img src='${item.screenshot}'></div>`,
			itunes_item_image: item.screenshot
		}))
	};
}
//#endregion
export { route };
