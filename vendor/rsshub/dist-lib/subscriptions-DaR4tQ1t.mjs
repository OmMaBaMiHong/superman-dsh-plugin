import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { l as utils_default } from "./google-DbLLXUn8.mjs";
import pMap from "p-map";
//#region lib/routes/youtube/subscriptions.ts
const route = {
	path: "/subscriptions/:embed?",
	categories: ["social-media"],
	example: "/youtube/subscriptions",
	parameters: { embed: "Default to embed the video, set to any value to disable embedding" },
	features: { requireConfig: [
		{
			name: "YOUTUBE_KEY",
			description: ""
		},
		{
			name: "YOUTUBE_CLIENT_ID",
			description: ""
		},
		{
			name: "YOUTUBE_CLIENT_SECRET",
			description: ""
		},
		{
			name: "YOUTUBE_REFRESH_TOKEN",
			description: ""
		}
	] },
	radar: [{
		source: ["www.youtube.com/feed/subscriptions", "www.youtube.com/feed/channels"],
		target: "/subscriptions"
	}],
	name: "Subscriptions",
	maintainers: ["TonyRL"],
	handler,
	url: "www.youtube.com/feed/subscriptions"
};
async function handler(ctx) {
	if (!config.youtube || !config.youtube.key || !config.youtube.clientId || !config.youtube.clientSecret || !config.youtube.refreshToken) throw new ConfigNotFoundError("YouTube RSS is disabled due to the lack of <a href=\"https://docs.rsshub.app/deploy/config#route-specific-configurations\">relevant config</a>");
	const embed = !ctx.req.param("embed");
	const channelIds = (await utils_default.getSubscriptions("snippet", cache_default)).data.items.map((item) => item.snippet.resourceId.channelId);
	const playlistIds = await pMap(channelIds, async (channelId) => (await utils_default.getChannelWithId(channelId, "contentDetails", cache_default)).data.items?.[0].contentDetails.relatedPlaylists.uploads, { concurrency: 30 });
	let items = await pMap(playlistIds.filter(Boolean), async (playlistId) => (await utils_default.getPlaylistItems(playlistId, "snippet", cache_default))?.data.items, { concurrency: 30 });
	items = items.flat();
	items = items.filter((i) => i && !i.error && i.snippet.title !== "Private video" && i.snippet.title !== "Deleted video").map((item) => {
		const snippet = item.snippet;
		const videoId = snippet.resourceId.videoId;
		const img = utils_default.getThumbnail(snippet.thumbnails);
		return {
			title: snippet.title,
			description: utils_default.renderDescription(embed, videoId, img, utils_default.formatDescription(snippet.description)),
			pubDate: parseDate(snippet.publishedAt),
			link: `https://www.youtube.com/watch?v=${videoId}`,
			author: snippet.videoOwnerChannelTitle,
			image: img.url
		};
	});
	const ret = {
		title: "Subscriptions - YouTube",
		description: "YouTube Subscriptions",
		link: "www.youtube.com/feed/subscriptions",
		item: items
	};
	ctx.set("json", {
		...ret,
		channelIds,
		playlistIds
	});
	return ret;
}
//#endregion
export { route };
