import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { l as utils_default } from "./google-DbLLXUn8.mjs";
import { load } from "cheerio";
//#region lib/routes/youtube/live.ts
const route = {
	path: "/live/:username/:embed?",
	categories: ["live"],
	example: "/youtube/live/@GawrGura",
	parameters: {
		username: "YouTuber id",
		embed: "Default to embed the video, set to any value to disable embedding"
	},
	features: {
		requireConfig: [{
			name: "YOUTUBE_KEY",
			description: "YouTube API Key (enable YouTube Data API v3), support multiple keys, split them with `,`, [API Key application](https://console.developers.google.com/), [YouTube Data API v3](https://console.cloud.google.com/apis/library/youtube.googleapis.com)"
		}],
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Live",
	maintainers: ["sussurr127"],
	handler
};
async function handler(ctx) {
	if (!config.youtube || !config.youtube.key) throw new ConfigNotFoundError("YouTube RSS is disabled due to the lack of <a href=\"https://docs.rsshub.app/deploy/config#route-specific-configurations\">relevant config</a>");
	const username = ctx.req.param("username");
	const embed = !ctx.req.param("embed");
	let channelName;
	let channelId;
	const $ = load((await got_default(`https://www.youtube.com/${username}`)).data);
	channelId = $("meta[itemprop=\"identifier\"]").attr("content");
	channelName = $("meta[itemprop=\"name\"]").attr("content");
	if (!channelId) {
		const channelInfo = (await utils_default.getChannelWithUsername(username, "snippet", cache_default)).data.items[0];
		channelId = channelInfo.id;
		channelName = channelInfo.snippet.title;
	}
	const data = (await utils_default.getLive(channelId, cache_default)).data.items;
	return {
		title: `${channelName || username}'s Live Status`,
		link: `https://www.youtube.com/channel/${channelId}`,
		description: `$${channelName || username}'s live streaming status`,
		item: data.map((item) => {
			const snippet = item.snippet;
			const liveVideoId = item.id.videoId;
			const img = utils_default.getThumbnail(snippet.thumbnails);
			return {
				title: snippet.title,
				description: utils_default.renderDescription(embed, liveVideoId, img, utils_default.formatDescription(snippet.description)),
				pubDate: parseDate(snippet.publishedAt),
				guid: liveVideoId,
				link: `https://www.youtube.com/watch?v=${liveVideoId}`,
				image: img.url
			};
		}),
		allowEmpty: true
	};
}
//#endregion
export { route };
