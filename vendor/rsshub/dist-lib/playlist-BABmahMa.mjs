import "./types-DNj6Etbg.mjs";
import { a as callApi, n as getDataByPlaylistId } from "./google-DbLLXUn8.mjs";
import { n as getDataByPlaylistId$1 } from "./youtubei-CCnHxUIL.mjs";
//#region lib/routes/youtube/playlist.ts
const route = {
	path: "/playlist/:id/:embed?",
	categories: ["social-media"],
	view: 3,
	example: "/youtube/playlist/PLqQ1RwlxOgeLTJ1f3fNMSwhjVgaWKo_9Z",
	parameters: {
		id: "YouTube playlist id",
		embed: "Default to embed the video, set to any value to disable embedding"
	},
	features: {
		requireConfig: [{
			name: "YOUTUBE_KEY",
			description: " YouTube API Key, support multiple keys, split them with `,`, [API Key application](https://console.developers.google.com/)",
			optional: true
		}],
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Playlist",
	maintainers: ["HenryQW"],
	handler
};
async function handler(ctx) {
	return await callApi({
		googleApi: getDataByPlaylistId,
		youtubeiApi: getDataByPlaylistId$1,
		params: {
			playlistId: ctx.req.param("id"),
			embed: !ctx.req.param("embed"),
			isJsonFeed: ctx.req.query("format") === "json"
		}
	});
}
//#endregion
export { route };
