import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as utils_default } from "./utils-CaBuujNr.mjs";
//#region lib/routes/spotify/artists-top.ts
const route = {
	path: "/top/artists",
	categories: ["multimedia"],
	example: "/spotify/top/artists",
	parameters: {},
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
	radar: [{ source: ["open.spotify.com/"] }],
	name: "Personal Top Artists",
	maintainers: ["outloudvi"],
	handler,
	url: "open.spotify.com/"
};
async function handler() {
	return {
		title: "Spotify: My Top Artists",
		allowEmpty: true,
		item: (await rofetch("https://api.spotify.com/v1/me/top/artists", {
			method: "GET",
			headers: { Authorization: `Bearer ${await utils_default.getPrivateToken()}` }
		})).items.map((element) => utils_default.parseArtist(element))
	};
}
//#endregion
export { route };
