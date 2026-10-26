import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as utils_default } from "./utils-CaBuujNr.mjs";
//#region lib/routes/spotify/saved.ts
const route = {
	path: "/saved/:limit?",
	categories: ["multimedia"],
	example: "/spotify/saved/50",
	parameters: { limit: "Track count, 50 by default" },
	features: {
		requireConfig: [
			{
				name: "SPOTIFY_CLIENT_ID",
				description: ""
			},
			{
				name: "SPOTIFY_CLIENT_SECRET",
				description: ""
			},
			{
				name: "SPOTIFY_REFRESHTOKEN",
				description: ""
			}
		],
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["open.spotify.com/collection/tracks"],
		target: "/saved"
	}],
	name: "Personal Saved Tracks",
	maintainers: ["outloudvi"],
	handler,
	url: "open.spotify.com/collection/tracks"
};
async function handler(ctx) {
	const token = await utils_default.getPrivateToken();
	const limit = ctx.req.param("limit");
	const pageSize = Number.isNaN(Number.parseInt(limit)) ? 50 : Number.parseInt(limit);
	const tracks = (await rofetch(`https://api.spotify.com/v1/me/tracks?limit=${pageSize}`, {
		method: "GET",
		headers: { Authorization: `Bearer ${token}` }
	})).items;
	return {
		title: "Spotify: My Saved Tracks",
		link: "https://open.spotify.com/collection/tracks",
		description: `Latest ${pageSize} saved tracks on Spotify.`,
		allowEmpty: true,
		item: tracks.map((x) => ({
			...utils_default.parseTrack(x.track),
			pubDate: parseDate(x.added_at)
		}))
	};
}
//#endregion
export { route };
