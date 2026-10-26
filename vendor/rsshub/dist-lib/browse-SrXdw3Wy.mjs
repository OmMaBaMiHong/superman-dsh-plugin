import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
//#region lib/routes/furaffinity/browse.ts
const route = {
	path: "/browse/:mode?",
	name: "Browse",
	url: "furaffinity.net",
	categories: ["social-media"],
	example: "/furaffinity/browse/nsfw",
	maintainers: ["TigerCubDen", "SkyNetX007"],
	parameters: { mode: "R18 content toggle, default value is sfw, options are sfw, nsfw" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	radar: [{
		source: ["furaffinity.net"],
		target: "/browse"
	}],
	handler
};
async function handler(ctx) {
	const { mode = "sfw" } = ctx.req.param();
	let url = "https://faexport.spangle.org.uk/browse.json?sfw=1";
	if (mode === "nsfw") url = "https://faexport.spangle.org.uk/browse.json";
	return {
		title: "Fur Affinity | Browse",
		link: "https://www.furaffinity.net/browse/",
		description: "Fur Affinity Browsing Artwork",
		item: (await rofetch(url, {
			method: "GET",
			headers: { Referer: "https://faexport.spangle.org.uk/" }
		})).map((item) => ({
			title: item.title,
			link: item.link,
			guid: item.id,
			description: `<img src="${item.thumbnail}">`,
			author: item.name
		}))
	};
}
//#endregion
export { route };
