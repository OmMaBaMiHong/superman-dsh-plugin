import { n as parseRelativeDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { i as getSrtAttachmentBatch, l as utils_default, o as getVideoUrl } from "./google-DbLLXUn8.mjs";
import { Innertube } from "youtubei.js";
//#region lib/routes/youtube/api/youtubei.ts
let innertubePromise;
const getInnertube = () => {
	if (!innertubePromise) innertubePromise = Innertube.create({ fetch: (input, init) => {
		const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
		return fetch(url, {
			method: input?.method,
			...init
		});
	} });
	return innertubePromise;
};
const getText = (value) => typeof value === "string" ? value : value?.text;
const getLockupPublishedText = (video) => video.metadata?.metadata?.metadata_rows?.flatMap((row) => row.metadata_parts ?? []).find((part) => part.text?.text?.includes(" ago"))?.text?.text;
const normalizeYouTubeiVideo = (video) => {
	const id = video.video_id || video.content_id || video.id;
	if (!id) return;
	return {
		id,
		title: getText(video.title) || getText(video.metadata?.title) || `YouTube Video ${id}`,
		image: video.best_thumbnail?.url || video.thumbnails?.[0]?.url || video.content_image?.image?.[0]?.url,
		description: video.description_snippet?.toHTML?.(),
		publishedText: video.published?.text || getLockupPublishedText(video),
		author: typeof video.author === "string" ? video.author : video.author?.name === "N/A" ? void 0 : video.author?.name,
		durationSeconds: video.duration && "seconds" in video.duration ? video.duration.seconds : void 0
	};
};
const getChannelIdByUsername = (username) => cache_default.tryGet(`youtube:getChannelIdByUsername:${username}`, async () => {
	return (await (await getInnertube()).resolveURL(`https://www.youtube.com/${username}`)).payload.browseId;
});
const getDataByUsername = async ({ username, embed, filterShorts, isJsonFeed }) => {
	const channelId = await getChannelIdByUsername(username);
	return getDataByChannelId({
		channelId,
		embed,
		filterShorts,
		isJsonFeed
	});
};
const getDataByChannelId = async ({ channelId, embed, isJsonFeed }) => {
	const channel = await (await getInnertube()).getChannel(channelId);
	const normalizedVideos = (await channel.getVideos()).videos.map(normalizeYouTubeiVideo).filter((video) => video !== void 0);
	const videoSubtitles = isJsonFeed ? await getSrtAttachmentBatch(normalizedVideos.map((video) => video.id)) : {};
	return {
		title: `${channel.metadata.title || channelId} - YouTube`,
		link: `https://www.youtube.com/channel/${channelId}`,
		image: channel.metadata.avatar?.[0].url,
		description: channel.metadata.description,
		item: await Promise.all(normalizedVideos.map((video) => {
			const srtAttachments = isJsonFeed ? videoSubtitles[video.id] || [] : [];
			return {
				title: video.title,
				description: utils_default.renderDescription(embed, video.id, video.image ? { url: video.image } : void 0, utils_default.formatDescription(video.description)),
				link: `https://www.youtube.com/watch?v=${video.id}`,
				author: video.author,
				image: video.image,
				pubDate: video.publishedText ? parseRelativeDate(video.publishedText) : void 0,
				attachments: [{
					url: getVideoUrl(video.id),
					mime_type: "text/html",
					duration_in_seconds: video.durationSeconds
				}, ...srtAttachments]
			};
		}))
	};
};
const getDataByPlaylistId = async ({ playlistId, embed }) => {
	const playlist = await (await getInnertube()).getPlaylist(playlistId);
	const videos = await playlist.videos;
	return {
		title: `${playlist.info.title || playlistId} by ${playlist.info.author.name} - YouTube`,
		link: `https://www.youtube.com/playlist?list=${playlistId}`,
		image: playlist.info.thumbnails?.[0].url,
		description: playlist.info.description || `${playlist.info.title} by ${playlist.info.author.name}`,
		item: videos.filter((video) => "id" in video).map((video) => {
			const img = "best_thumbnail" in video ? video.best_thumbnail?.url : video.thumbnails?.[0]?.url;
			return {
				title: video.title.text || `YouTube Video ${video.id}`,
				description: utils_default.renderDescription(embed, video.id, img, ""),
				link: `https://www.youtube.com/watch?v=${video.id}`,
				pubDate: "published" in video && video.published?.text ? parseRelativeDate(video.published.text) : void 0,
				author: "author" in video ? [{
					name: video.author.name,
					url: video.author.url,
					avatar: video.author.thumbnails?.[0]?.url
				}] : void 0,
				image: img,
				attachments: [{
					url: getVideoUrl(video.id),
					mime_type: "text/html",
					duration_in_seconds: "duration" in video && video.duration && "seconds" in video.duration ? video.duration.seconds : void 0
				}]
			};
		})
	};
};
//#endregion
export { getDataByPlaylistId as n, getDataByUsername as r, getDataByChannelId as t };
