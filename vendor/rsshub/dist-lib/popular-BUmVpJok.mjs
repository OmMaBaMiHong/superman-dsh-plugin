import { n as processList, r as rootUrl, t as getRelativeUrlList } from "./utils-BtOfZlpH.mjs";
//#region lib/routes/joshwcomeau/popular.ts
const route = {
	path: "/popular",
	categories: ["programming"],
	example: "/joshwcomeau/popular",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["joshwcomeau.com/"],
		target: "/popular"
	}],
	name: "Popular Content",
	maintainers: ["Rjnishant530"],
	handler
};
async function handler() {
	const { urls } = await getRelativeUrlList(rootUrl, "section > ol > li > a");
	return {
		title: "Popular Content | Josh W. Comeau",
		description: "Friendly tutorials for developers. Focus on React, CSS, Animation, and more!",
		link: rootUrl,
		item: await processList(urls),
		icon: `${rootUrl}/favicon.png`,
		logo: `${rootUrl}/favicon.png`
	};
}
//#endregion
export { route };
