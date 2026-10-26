import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as mapPostToItem } from "./utils-DDbMvaYx.mjs";
//#region lib/routes/thewirehindi/index.ts
const route = {
	path: "/",
	categories: ["new-media"],
	example: "/thewirehindi",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["thewirehindi.com/"] }],
	name: "Latest News",
	maintainers: ["Rjnishant530"],
	handler,
	url: "thewirehindi.com/"
};
async function handler() {
	const { data } = await got_default("https://thewirehindi.com/wp-json/wp/v2/posts?_embed");
	return {
		title: "The Wire Hindi - Latest News",
		link: "https://thewirehindi.com/",
		item: data.map((v) => mapPostToItem(v)),
		description: "Latest news from The Wire Hindi",
		logo: "https://thewirehindi.com/wp-content/uploads/2023/05/cropped-The-wire-32x32.jpeg",
		language: "hi"
	};
}
//#endregion
export { route };
