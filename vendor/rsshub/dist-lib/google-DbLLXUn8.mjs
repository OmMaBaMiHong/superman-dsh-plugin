import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as NotFoundError } from "./not-found-BvVU2U31.mjs";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration.js";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import * as cheerio from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
import pMap from "p-map";
import { google } from "googleapis";
import { getSubtitles } from "youtube-caption-extractor";
//#region lib/routes/youtube/utils.tsx
const getPlaylistItems = (id, part, cache) => cache.tryGet(`youtube:getPlaylistItems:${id}`, async () => {
	return await exec((youtube) => youtube.playlistItems.list({
		part,
		playlistId: id,
		maxResults: 50
	}));
}, config.cache.routeExpire, false);
const getPlaylist = (id, part, cache) => cache.tryGet(`youtube:getPlaylist:${id}`, async () => {
	return await exec((youtube) => youtube.playlists.list({
		part,
		id
	}));
});
const getChannelWithId = (id, part, cache) => cache.tryGet(`youtube:getChannelWithId:${id}`, async () => {
	return await exec((youtube) => youtube.channels.list({
		part,
		id
	}));
});
const getChannelWithUsername = (username, part, cache) => cache.tryGet(`youtube:getChannelWithUsername:${username}`, async () => {
	return await exec((youtube) => youtube.channels.list({
		part,
		forUsername: username
	}));
});
const getVideos = (id, part, cache) => cache.tryGet(`youtube:getVideos:${id}`, async () => {
	return await exec((youtube) => youtube.videos.list({
		part,
		id
	}));
});
const getThumbnail = (thumbnails) => thumbnails.maxres || thumbnails.standard || thumbnails.high || thumbnails.medium || thumbnails.default;
const formatDescription = (description) => description?.replaceAll(/\r\n|\r|\n/g, "<br>");
const renderDescription = (embed, videoId, img, description) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	embed ? /* @__PURE__ */ jsx("iframe", {
		id: "ytplayer",
		type: "text/html",
		width: "640",
		height: "360",
		src: (config.youtube?.videoEmbedUrl || "https://www.youtube-nocookie.com/embed/") + videoId,
		frameborder: "0",
		allowfullscreen: true,
		referrerpolicy: "strict-origin-when-cross-origin"
	}) : /* @__PURE__ */ jsx("img", { src: img?.url ?? "" }),
	/* @__PURE__ */ jsx("br", {}),
	description ? /* @__PURE__ */ jsx(Fragment, { children: raw(description) }) : null
] }));
const getSubscriptions = async (part, cache) => {
	let accessToken = await cache.get("youtube:accessToken", false);
	if (!accessToken) {
		accessToken = (await youtubeOAuth2Client.getAccessToken()).token;
		await cache.set("youtube:accessToken", accessToken, 3600);
	}
	youtubeOAuth2Client.setCredentials({
		access_token: accessToken,
		refresh_token: config.youtube.refreshToken
	});
	return cache.tryGet("youtube:getSubscriptions", () => getSubscriptionsRecusive(part), config.cache.routeExpire, false);
};
async function getSubscriptionsRecusive(part, nextPageToken) {
	const res = await google.youtube("v3").subscriptions.list({
		auth: youtubeOAuth2Client,
		part,
		mine: true,
		maxResults: 50,
		pageToken: nextPageToken ?? void 0
	});
	if (res.data.nextPageToken) {
		const next = await getSubscriptionsRecusive(part, res.data.nextPageToken);
		if (next.data.items) res.data.items = [...res.data.items || [], ...next.data.items];
	}
	return res;
}
const isYouTubeChannelId = (id) => /^UC[\w-]{21}[AQgw]$/.test(id);
const getLive = (id, cache) => cache.tryGet(`youtube:getLive:${id}`, async () => {
	return await exec((youtube) => youtube.search.list({
		part: "snippet",
		channelId: id,
		eventType: "live",
		type: "video"
	}));
}, config.cache.routeExpire, false);
const getVideoUrl = (id) => `https://www.youtube-nocookie.com/embed/${id}?controls=1&autoplay=1&mute=0`;
const getPlaylistWithShortsFilter = (id, filterShorts = true) => {
	if (filterShorts) {
		if (id.startsWith("UC")) return "UULF" + id.slice(2);
		if (id.startsWith("UU")) return "UULF" + id.slice(2);
	}
	return id;
};
const callApi = async function callApi({ googleApi, youtubeiApi, params }) {
	if (config.youtube?.key) try {
		return await googleApi(params);
	} catch {
		return await youtubeiApi(params);
	}
	return await youtubeiApi(params);
};
var utils_default = {
	getPlaylistItems,
	getPlaylist,
	getChannelWithId,
	getChannelWithUsername,
	getVideos,
	getThumbnail,
	formatDescription,
	renderDescription,
	getSubscriptions,
	getSubscriptionsRecusive,
	isYouTubeChannelId,
	getLive,
	getVideoUrl,
	getPlaylistWithShortsFilter
};
//#endregion
//#region lib/routes/youtube/api/subtitles.ts
function pad(n, width = 2) {
	return String(n).padStart(width, "0");
}
function toSrtTime(seconds) {
	const totalMs = Math.floor(seconds * 1e3);
	const hours = Math.floor(totalMs / 36e5);
	const minutes = Math.floor(totalMs % 36e5 / 6e4);
	const secs = Math.floor(totalMs % 6e4 / 1e3);
	const millis = totalMs % 1e3;
	return `${pad(hours)}:${pad(minutes)}:${pad(secs)},${pad(millis, 3)}`;
}
function convertToSrt(segments) {
	return segments.map((seg, index) => {
		const start = Number(seg.start);
		const end = start + Number(seg.dur);
		return `${index + 1}
${toSrtTime(start)} --> ${toSrtTime(end)}
${seg.text}
`;
	}).join("\n");
}
const getSubtitlesByVideoId = (videoId) => cache_default.tryGet(`youtube:getSubtitlesByVideoId:${videoId}`, async () => {
	try {
		return convertToSrt(await getSubtitles({ videoID: videoId }));
	} catch {
		return "";
	}
});
const createSubtitleDataUrl = (srt) => `data:text/plain;charset=utf-8,${encodeURIComponent(srt)}`;
function createSrtAttachmentFromSrt(srt) {
	if (!srt || srt.trim() === "") return [];
	return [{
		url: createSubtitleDataUrl(srt),
		mime_type: "text/srt",
		title: "Subtitles"
	}];
}
const getSrtAttachmentBatch = async (videoIds) => {
	const results = await pMap(videoIds, async (videoId) => {
		return {
			videoId,
			srt: createSrtAttachmentFromSrt(await getSubtitlesByVideoId(videoId))
		};
	}, { concurrency: 5 });
	return Object.fromEntries(results.map(({ videoId, srt }) => [videoId, srt]));
};
//#endregion
//#region lib/routes/youtube/api/google.ts
const { OAuth2 } = google.auth;
dayjs.extend(duration);
let count = 0;
const youtube = {};
if (config.youtube && config.youtube.key) {
	const keys = config.youtube.key.split(",");
	for (const [index, key] of keys.entries()) {
		if (!key) continue;
		youtube[index] = google.youtube({
			version: "v3",
			auth: key
		});
		count = index + 1;
	}
}
let index = -1;
const exec = async (func) => {
	let result;
	for (let i = 0; i < count; i++) {
		index++;
		try {
			result = await func(youtube[index % count]);
			break;
		} catch {}
	}
	return result;
};
let youtubeOAuth2Client;
if (config.youtube && config.youtube.clientId && config.youtube.clientSecret && config.youtube.refreshToken) {
	youtubeOAuth2Client = new OAuth2(config.youtube.clientId, config.youtube.clientSecret, "https://developers.google.com/oauthplayground");
	youtubeOAuth2Client.setCredentials({ refresh_token: config.youtube.refreshToken });
}
const getDataByUsername = async ({ username, embed, filterShorts, isJsonFeed }) => {
	let userHandleData;
	if (username.startsWith("@")) userHandleData = await cache_default.tryGet(`youtube:handle:${username}`, async () => {
		const response = await rofetch(`https://www.youtube.com/${username}`);
		const $ = cheerio.load(response);
		const metadataRenderer = JSON.parse($("script").text().match(/ytInitialData = (\{.*?\});/)?.[1] || "{}").metadata.channelMetadataRenderer;
		const channelId = metadataRenderer.externalId;
		return {
			channelName: metadataRenderer.title,
			image: metadataRenderer.avatar?.thumbnails?.[0]?.url,
			description: metadataRenderer.description,
			playlistId: (await utils_default.getChannelWithId(channelId, "contentDetails", cache_default)).data.items[0].contentDetails.relatedPlaylists.uploads
		};
	});
	const playlistId = await (async () => {
		if (userHandleData?.playlistId) {
			const origPlaylistId = userHandleData.playlistId;
			return utils_default.getPlaylistWithShortsFilter(origPlaylistId, filterShorts);
		}
		const items = (await utils_default.getChannelWithUsername(username, "contentDetails", cache_default)).data.items;
		if (!items) throw new NotFoundError(`The channel https://www.youtube.com/user/${username} does not exist.`);
		const channelId = items[0].id;
		return filterShorts ? utils_default.getPlaylistWithShortsFilter(channelId, filterShorts) : items[0].contentDetails.relatedPlaylists.uploads;
	})();
	const playlistItems = await utils_default.getPlaylistItems(playlistId, "snippet", cache_default);
	if (!playlistItems) throw new NotFoundError("This channel doesn't have any content.");
	const videoIds = playlistItems.data.items.map((item) => item.snippet.resourceId.videoId);
	const videoDetails = await utils_default.getVideos(videoIds.join(","), "contentDetails", cache_default);
	const subtitlesMap = isJsonFeed ? await getSrtAttachmentBatch(videoIds) : {};
	return {
		title: `${userHandleData?.channelName || username} - YouTube`,
		link: username.startsWith("@") ? `https://www.youtube.com/${username}` : `https://www.youtube.com/user/${username}`,
		description: userHandleData?.description || `YouTube user ${username}`,
		image: userHandleData?.image,
		item: playlistItems.data.items.filter((d) => d.snippet.title !== "Private video" && d.snippet.title !== "Deleted video").map((item) => {
			const snippet = item.snippet;
			const videoId = snippet.resourceId.videoId;
			const img = utils_default.getThumbnail(snippet.thumbnails);
			const detail = videoDetails?.data.items.find((d) => d.id === videoId);
			const srtAttachments = subtitlesMap ? subtitlesMap[videoId] || [] : [];
			return {
				title: snippet.title,
				description: utils_default.renderDescription(embed, videoId, img, utils_default.formatDescription(snippet.description)),
				pubDate: parseDate(snippet.publishedAt),
				link: `https://www.youtube.com/watch?v=${videoId}`,
				author: snippet.videoOwnerChannelTitle,
				image: img.url,
				attachments: [{
					url: getVideoUrl(videoId),
					mime_type: "text/html",
					duration_in_seconds: detail?.contentDetails.duration ? dayjs.duration(detail.contentDetails.duration).asSeconds() : void 0
				}, ...srtAttachments]
			};
		})
	};
};
const getDataByChannelId = async ({ channelId, embed, filterShorts, isJsonFeed }) => {
	const originalPlaylistId = filterShorts ? null : (await utils_default.getChannelWithId(channelId, "contentDetails", cache_default)).data.items[0].contentDetails.relatedPlaylists.uploads;
	const playlistId = filterShorts ? utils_default.getPlaylistWithShortsFilter(channelId) : originalPlaylistId;
	const data = (await utils_default.getPlaylistItems(playlistId, "snippet", cache_default)).data.items;
	const videoIds = data.map((item) => item.snippet.resourceId.videoId);
	const videoDetails = await utils_default.getVideos(videoIds.join(","), "contentDetails", cache_default);
	const subtitlesMap = isJsonFeed ? await getSrtAttachmentBatch(videoIds) : {};
	return {
		title: `${data[0].snippet.channelTitle} - YouTube`,
		link: `https://www.youtube.com/channel/${channelId}`,
		description: `YouTube channel ${data[0].snippet.channelTitle}`,
		item: data.filter((d) => d.snippet.title !== "Private video" && d.snippet.title !== "Deleted video").map((item) => {
			const snippet = item.snippet;
			const videoId = snippet.resourceId.videoId;
			const img = utils_default.getThumbnail(snippet.thumbnails);
			const detail = videoDetails?.data.items.find((d) => d.id === videoId);
			const srtAttachments = subtitlesMap ? subtitlesMap[videoId] || [] : [];
			return {
				title: snippet.title,
				description: utils_default.renderDescription(embed, videoId, img, utils_default.formatDescription(snippet.description)),
				pubDate: parseDate(snippet.publishedAt),
				link: `https://www.youtube.com/watch?v=${videoId}`,
				author: snippet.videoOwnerChannelTitle,
				image: img.url,
				attachments: [{
					url: getVideoUrl(videoId),
					mime_type: "text/html",
					duration_in_seconds: detail?.contentDetails.duration ? dayjs.duration(detail.contentDetails.duration).asSeconds() : void 0
				}, ...srtAttachments]
			};
		})
	};
};
const getDataByPlaylistId = async ({ playlistId, embed, isJsonFeed }) => {
	const playlistTitle = (await utils_default.getPlaylist(playlistId, "snippet", cache_default)).data.items[0].snippet.title;
	const data = (await utils_default.getPlaylistItems(playlistId, "snippet", cache_default)).data.items.filter((d) => d.snippet.title !== "Private video" && d.snippet.title !== "Deleted video");
	const videoIds = data.map((item) => item.snippet.resourceId.videoId);
	const videoDetails = await utils_default.getVideos(videoIds.join(","), "contentDetails", cache_default);
	const subtitlesMap = isJsonFeed ? await getSrtAttachmentBatch(videoIds) : {};
	return {
		title: `${playlistTitle} by ${data[0].snippet.channelTitle} - YouTube`,
		link: `https://www.youtube.com/playlist?list=${playlistId}`,
		description: `${playlistTitle} by ${data[0].snippet.channelTitle}`,
		item: data.map((item) => {
			const snippet = item.snippet;
			const videoId = snippet.resourceId.videoId;
			const img = utils_default.getThumbnail(snippet.thumbnails);
			const detail = videoDetails?.data.items.find((d) => d.id === videoId);
			const srtAttachments = subtitlesMap ? subtitlesMap[videoId] || [] : [];
			return {
				title: snippet.title,
				description: utils_default.renderDescription(embed, videoId, img, utils_default.formatDescription(snippet.description)),
				pubDate: parseDate(snippet.publishedAt),
				link: `https://www.youtube.com/watch?v=${videoId}`,
				author: snippet.videoOwnerChannelTitle,
				image: img.url,
				attachments: [{
					url: getVideoUrl(videoId),
					mime_type: "text/html",
					duration_in_seconds: detail?.contentDetails.duration ? dayjs.duration(detail.contentDetails.duration).asSeconds() : void 0
				}, ...srtAttachments]
			};
		})
	};
};
//#endregion
export { callApi as a, renderDescription as c, getSrtAttachmentBatch as i, utils_default as l, getDataByPlaylistId as n, getVideoUrl as o, getDataByUsername as r, isYouTubeChannelId as s, getDataByChannelId as t };
