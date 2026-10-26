import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { a as callApi, l as utils_default, t as getDataByChannelId } from "./google-DbLLXUn8.mjs";
import { t as getDataByChannelId$1 } from "./youtubei-CCnHxUIL.mjs";
//#region lib/routes/youtube/channel.ts
const route = {
	path: "/channel/:id/:routeParams?",
	categories: ["social-media"],
	example: "/youtube/channel/UCDwDMPOZfxVV0x_dz0eQ8KQ",
	parameters: {
		id: "YouTube channel id",
		routeParams: "Extra parameters, see the table below"
	},
	radar: [{
		source: ["www.youtube.com/channel/:id"],
		target: "/channel/:id"
	}],
	name: "Channel with id",
	maintainers: ["DIYgod", "pseudoyu"],
	handler,
	description: `::: tip Parameter

| Name         | Description                                                                        | Default |
| ------------ | ---------------------------------------------------------------------------------- | ------- |
| embed        | Whether to embed the video, fill in any value to disable embedding                 | embed   |
| filterShorts | Whether to filter out shorts from the feed, fill in any falsy value to show shorts | true    |

:::

::: tip
YouTube provides official RSS feeds for channels, for instance <https://www.youtube.com/feeds/videos.xml?channel_id=UCDwDMPOZfxVV0x_dz0eQ8KQ>.
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
	}
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const routeParams = ctx.req.param("routeParams");
	const params = new URLSearchParams(routeParams);
	const embed = !params.get("embed");
	const filterShortsStr = params.get("filterShorts");
	const filterShorts = [
		null,
		"",
		"true"
	].includes(filterShortsStr);
	if (!utils_default.isYouTubeChannelId(id)) throw new InvalidParameterError("Invalid YouTube channel ID. \nYou may want to use <code>/youtube/user/:id</code> instead.");
	return await callApi({
		googleApi: getDataByChannelId,
		youtubeiApi: getDataByChannelId$1,
		params: {
			channelId: id,
			embed,
			filterShorts,
			isJsonFeed: ctx.req.query("format") === "json"
		}
	});
}
//#endregion
export { route };
