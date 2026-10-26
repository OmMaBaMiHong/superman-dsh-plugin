import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { l as utils_default } from "./google-DbLLXUn8.mjs";
import { load } from "cheerio";
//#region lib/routes/youtube/custom.ts
const route = {
	path: "/c/:username/:embed?",
	categories: ["social-media"],
	example: "/youtube/c/YouTubeCreators",
	parameters: {
		username: "YouTube custom URL",
		embed: "Default to embed the video, set to any value to disable embedding"
	},
	features: {
		requireConfig: [{
			name: "YOUTUBE_KEY",
			description: " YouTube API Key, support multiple keys, split them with `,`, [API Key application](https://console.developers.google.com/)"
		}],
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["www.youtube.com/c/:id"],
		target: "/c/:id"
	}],
	name: "Custom URL",
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	if (!config.youtube || !config.youtube.key) throw new ConfigNotFoundError("YouTube RSS is disabled due to the lack of <a href=\"https://docs.rsshub.app/deploy/config#route-specific-configurations\">relevant config</a>");
	const username = ctx.req.param("username");
	const embed = !ctx.req.param("embed");
	const { data: response } = await got_default(`https://www.youtube.com/c/${username}`);
	const $ = load(response);
	const ytInitialData = JSON.parse($("script").text().match(/ytInitialData = (\{.*?\});/)?.[1] || "{}");
	const externalId = ytInitialData.metadata.channelMetadataRenderer.externalId;
	const playlistId = (await utils_default.getChannelWithId(externalId, "contentDetails", cache_default)).data.items[0].contentDetails.relatedPlaylists.uploads;
	const data = (await utils_default.getPlaylistItems(playlistId, "snippet", cache_default)).data.items;
	return {
		title: `${username} - YouTube`,
		link: `https://www.youtube.com/c/${username}`,
		description: ytInitialData.metadata.channelMetadataRenderer.description,
		image: ytInitialData.metadata.channelMetadataRenderer.avatar?.thumbnails?.[0]?.url,
		item: data.filter((d) => d.snippet.title !== "Private video" && d.snippet.title !== "Deleted video").map((item) => {
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
		})
	};
}
//#endregion
export { route };
