import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as utils_default } from "./utils-CaBuujNr.mjs";
//#region lib/routes/spotify/playlist.ts
const route = {
	path: "/playlist/:id",
	categories: ["multimedia"],
	view: 4,
	example: "/spotify/playlist/4UBVy1LttvodwivPUuwJk2",
	parameters: { id: "Playlist ID" },
	features: {
		requireConfig: [{
			name: "SPOTIFY_CLIENT_ID",
			description: ""
		}, {
			name: "SPOTIFY_CLIENT_SECRET",
			description: ""
		}],
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	description: `::: warning
Due to [limitations by Spotify](https://developer.spotify.com/blog/2024-11-27-changes-to-the-web-api), this endpoint is unable to access "Algorithmic and Spotify-owned editorial playlists".
:::`,
	radar: [{ source: ["open.spotify.com/playlist/:id"] }],
	name: "Playlist",
	maintainers: ["outloudvi"],
	handler
};
async function handler(ctx) {
	const token = await utils_default.getPublicToken();
	const meta = await rofetch(`https://api.spotify.com/v1/playlists/${ctx.req.param("id")}`, {
		method: "GET",
		headers: { Authorization: `Bearer ${token}` }
	});
	const tracks = meta.tracks.items;
	return {
		title: meta.name,
		link: meta.external_urls.spotify,
		description: meta.description,
		allowEmpty: true,
		item: tracks.map((x) => ({
			...utils_default.parseTrack(x.track),
			pubDate: parseDate(x.added_at)
		})),
		image: meta.images.length ? meta.images[0].url : void 0
	};
}
//#endregion
export { route };
