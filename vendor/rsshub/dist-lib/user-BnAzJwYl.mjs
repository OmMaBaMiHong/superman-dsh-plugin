import "./types-DNj6Etbg.mjs";
import { a as callApi, r as getDataByUsername } from "./google-DbLLXUn8.mjs";
import { r as getDataByUsername$1 } from "./youtubei-CCnHxUIL.mjs";
//#region lib/routes/youtube/user.ts
const route = {
	path: "/user/:username/:routeParams?",
	categories: ["social-media"],
	view: 3,
	example: "/youtube/user/@JFlaMusic",
	parameters: {
		username: "YouTuber handle with @",
		routeParams: "Extra parameters, see the table below"
	},
	description: `::: tip Parameter

| Name         | Description                                                                        | Default |
| ------------ | ---------------------------------------------------------------------------------- | ------- |
| embed        | Whether to embed the video, fill in any value to disable embedding                 | embed   |
| filterShorts | Whether to filter out shorts from the feed, fill in any falsy value to show shorts | true    |

:::`,
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
	radar: [{
		source: [
			"www.youtube.com/user/:username",
			"www.youtube.com/:username",
			"www.youtube.com/:username/videos"
		],
		target: "/user/:username"
	}],
	name: "Channel with user handle",
	maintainers: ["DIYgod", "pseudoyu"],
	handler
};
async function handler(ctx) {
	const username = ctx.req.param("username");
	const routeParams = ctx.req.param("routeParams");
	const params = new URLSearchParams(routeParams);
	const embed = !params.get("embed");
	const filterShortsStr = params.get("filterShorts");
	return await callApi({
		googleApi: getDataByUsername,
		youtubeiApi: getDataByUsername$1,
		params: {
			username,
			embed,
			filterShorts: [
				null,
				"",
				"true"
			].includes(filterShortsStr),
			isJsonFeed: ctx.req.query("format") === "json"
		}
	});
}
//#endregion
export { route };
