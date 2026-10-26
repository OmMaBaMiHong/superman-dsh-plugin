import { t as NotFoundError } from "./not-found-BvVU2U31.mjs";
import { a as unwrapMedia, i as getStory, t as getClient } from "./client-CpemqeNr.mjs";
import { n as handleMedia, t as configureMiddlewares } from "./channel-media-CA_XUdoY.mjs";
import { n as getMediaLink, t as getGeoLink } from "./channel-Dfe7BPDI.mjs";
import { Api } from "telegram";
//#region lib/routes/telegram/stories.ts
const route = {
	path: "/stories/:username/:story?",
	categories: ["social-media"],
	example: "/telegram/stories/telegram",
	parameters: {
		username: "entity name",
		story: "story"
	},
	features: {
		requireConfig: [
			{
				name: "TELEGRAM_SESSION",
				optional: false,
				description: "Telegram API Authentication"
			},
			{
				name: "TELEGRAM_API_ID",
				optional: true,
				description: "Telegram API ID"
			},
			{
				name: "TELEGRAM_API_HASH",
				optional: true,
				description: "Telegram API Hash"
			},
			{
				name: "TELEGRAM_MAX_CONCURRENT_DOWNLOADS",
				optional: true,
				description: "Telegram Max Concurrent Downloads"
			},
			{
				name: "TELEGRAM_PROXY_HOST",
				optional: true,
				description: "Telegram Proxy Host"
			},
			{
				name: "TELEGRAM_PROXY_PORT",
				optional: true,
				description: "Telegram Proxy Port"
			},
			{
				name: "TELEGRAM_PROXY_SECRET",
				optional: true,
				description: "Telegram Proxy Secret"
			}
		],
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [],
	name: "Stories",
	maintainers: ["synchrone"],
	handler,
	description: ""
};
function getMediaAreas(mediaAreas) {
	let description = "";
	const areas = mediaAreas ?? [];
	for (const area of areas) if (area instanceof Api.MediaAreaChannelPost) {} else if ((area instanceof Api.MediaAreaGeoPoint || area instanceof Api.MediaAreaVenue) && area.geo instanceof Api.GeoPoint) description += getGeoLink(area.geo);
	else if (area instanceof Api.MediaAreaSuggestedReaction) {
		if (area.reaction instanceof Api.ReactionEmoji) description += area.reaction.emoticon;
		else if (area.reaction instanceof Api.ReactionCustomEmoji) {}
	}
	return description;
}
async function handler(ctx) {
	const c = await getClient();
	const { username, story } = ctx.req.param();
	if (!username) throw new NotFoundError();
	const peer = await c.getInputEntity(username);
	if (story) {
		const storyItem = await getStory(peer, Number(story));
		await configureMiddlewares(ctx);
		return await handleMedia(storyItem.media, c, ctx);
	}
	const storiesRes = await c.invoke(new Api.stories.GetPeerStories({ peer }));
	const item = [];
	for (const story of storiesRes.stories.stories) {
		if (!(story instanceof Api.StoryItem)) continue;
		const src = `${new URL(ctx.req.url).origin}/telegram/stories/${username}/${story.id}`;
		const pubDate = (/* @__PURE__ */ new Date(story.date * 1e3)).toUTCString();
		const media = await unwrapMedia(story.media);
		if (!media) continue;
		const description = getMediaLink(src, media) + getMediaAreas(story.mediaAreas);
		item.push({
			title: story.caption ?? pubDate,
			description,
			pubDate,
			link: `https://t.me/${username}/s/${story.id}`,
			author: username
		});
	}
	return {
		title: `Stories of @${username}`,
		link: `https://t.me/${username}`,
		item,
		allowEmpty: ctx.req.param("id") === "allow_empty",
		description: `Stories of @${username} on Telegram`
	};
}
//#endregion
export { handler as default, route };
