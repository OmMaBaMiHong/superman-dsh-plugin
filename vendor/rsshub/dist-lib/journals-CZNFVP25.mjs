import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
//#region lib/routes/furaffinity/journals.ts
const route = {
	path: "/journals/:username",
	name: "Journals",
	url: "furaffinity.net",
	categories: ["social-media"],
	example: "/furaffinity/journals/fender",
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
		source: ["furaffinity.net/journals/:username"],
		target: "/journals/:username"
	}],
	handler
};
async function handler(ctx) {
	const { username } = ctx.req.param();
	const items = (await rofetch(`https://faexport.spangle.org.uk/user/${username}/journals.json?full=1`, {
		method: "GET",
		headers: { Referer: "https://faexport.spangle.org.uk/" }
	})).map((item) => ({
		title: item.title,
		link: item.link,
		guid: item.id,
		description: item.description,
		pubDate: new Date(item.posted_at).toUTCString(),
		author: username
	}));
	return {
		allowEmpty: true,
		title: `Fur Affinity | ${username}'s Journals`,
		link: `https://www.furaffinity.net/journals/${username}`,
		description: `Fur Affinity ${username}'s Journals`,
		item: items
	};
}
//#endregion
export { route };
