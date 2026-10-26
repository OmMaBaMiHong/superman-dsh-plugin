import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
//#region lib/routes/soundon/podcast.ts
const handler = async (ctx) => {
	const { id } = ctx.req.param();
	const apiEndpoint = "https://api.soundon.fm/v2/client";
	const apiToken = "KilpEMLQeNzxmNBL55u5";
	const podcastInfo = await cache_default.tryGet(`soundon:${id}`, async () => {
		return (await rofetch(`${apiEndpoint}/podcasts/${id}`, { headers: { "api-token": apiToken } })).data.data;
	});
	const items = (await cache_default.tryGet(`soundon:${id}:episodes`, async () => {
		return (await rofetch(`${apiEndpoint}/podcasts/${id}/episodes`, { headers: { "api-token": apiToken } })).data;
	}, config.cache.routeExpire, false)).map(({ data: item }) => ({
		title: item.title,
		description: item.contentEncoded,
		link: item.url,
		author: item.artistName,
		pubDate: parseDate(item.publishDate),
		itunes_item_image: item.cover,
		enclosure_url: item.audioUrl,
		enclosure_type: item.audioType,
		itunes_duration: item.duration,
		category: item.itunesKeywords
	}));
	return {
		title: podcastInfo.title,
		description: podcastInfo.description,
		itunes_author: podcastInfo.artistName,
		itunes_category: podcastInfo.itunesCategories.join(", "),
		itunes_explicit: podcastInfo.explicit,
		image: podcastInfo.cover,
		language: podcastInfo.language,
		link: podcastInfo.url,
		item: items
	};
};
const route = {
	path: "/p/:id",
	categories: ["multimedia"],
	example: "/soundon/p/33a68cdc-18ad-4192-84cc-22bd7fdc6a31",
	parameters: { id: "Podcast ID" },
	features: { supportPodcast: true },
	radar: [{ source: ["player.soundon.fm/p/:id"] }],
	name: "Podcast",
	maintainers: ["TonyRL"],
	view: 4,
	handler
};
//#endregion
export { route };
