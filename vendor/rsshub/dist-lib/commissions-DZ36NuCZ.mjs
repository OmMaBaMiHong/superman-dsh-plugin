import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
//#region lib/routes/furaffinity/commissions.ts
const route = {
	path: "/commissions/:username",
	name: "Commissions",
	url: "furaffinity.net",
	categories: ["social-media"],
	example: "/furaffinity/commissions/fender",
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
		source: ["furaffinity.net/commissions/:username"],
		target: "/commissions/:username"
	}],
	handler
};
async function handler(ctx) {
	const { username } = ctx.req.param();
	const items = (await rofetch(`https://faexport.spangle.org.uk/user/${username}/commissions.json?full=1`, {
		method: "GET",
		headers: { Referer: "https://faexport.spangle.org.uk/" }
	})).map((item) => ({
		title: item.title,
		link: item.submission.link,
		guid: item.submission.id,
		description: `${item.description} <br> <img src="${item.submission.thumbnail}">`,
		author: username
	}));
	return {
		allowEmpty: true,
		title: `Fur Affinity | ${username}'s Commissions`,
		link: `https://www.furaffinity.net/commissions/${username}`,
		description: `Fur Affinity ${username}'s Commissions`,
		item: items
	};
}
//#endregion
export { route };
