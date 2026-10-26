import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
//#region lib/routes/furaffinity/watchers.ts
const route = {
	path: "/watchers/:username",
	name: `User's Watcher List`,
	url: "furaffinity.net",
	categories: ["social-media"],
	example: "/furaffinity/watchers/fender",
	maintainers: ["TigerCubDen", "SkyNetX007"],
	parameters: { username: "Username, can find in userpage" },
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
		source: ["furaffinity.net/watchlist/to/:username"],
		target: "/watchers/:username"
	}],
	handler
};
async function handler(ctx) {
	const { username } = ctx.req.param();
	const data = await rofetch(`https://faexport.spangle.org.uk/user/${username}/watchers.json`, {
		method: "GET",
		headers: { Referer: "https://faexport.spangle.org.uk/" }
	});
	const watchersCount = (await rofetch(`https://faexport.spangle.org.uk/user/${username}.json`, {
		method: "GET",
		headers: { Referer: "https://faexport.spangle.org.uk/" }
	})).watchers.count;
	const items = data.map((item) => ({
		title: item,
		link: `https://www.furaffinity.net/user/${item}`,
		guid: item,
		description: `${username} was watched by ${item} <br> Total: ${watchersCount}`,
		author: item
	}));
	return {
		title: `Fur Affinity | Watchers of ${username}`,
		link: `https://www.furaffinity.net/watchlist/to/${username}/`,
		description: `Fur Affinity Watchers of ${username}`,
		item: items
	};
}
//#endregion
export { route };
