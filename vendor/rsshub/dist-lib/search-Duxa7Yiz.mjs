import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { n as queryToBoolean } from "./readable-social-DP5kGwF5.mjs";
import { a as getGuild, n as baseUrl, s as searchGuildMessages, t as VALID_HAS_TYPES } from "./discord-api-CpkJyTNw.mjs";
import { t as renderDescription } from "./message-BKKhzMf4.mjs";
//#region lib/routes/discord/search.ts
const route = {
	path: "/search/:guildId/:routeParams",
	categories: ["social-media"],
	example: "/discord/search/302094807046684672/content=friendly&has=image,video",
	parameters: {
		guildId: "Guild ID",
		routeParams: "Search parameters, support content, author_id, mentions, has, min_id, max_id, channel_id, pinned"
	},
	features: {
		requireConfig: [{
			name: "DISCORD_AUTHORIZATION",
			description: "Discord authorization header"
		}],
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Guild Search",
	maintainers: ["NekoAria"],
	handler
};
const parseSearchParams = (routeParams) => {
	const parsed = new URLSearchParams(routeParams);
	const validHasTypes = (parsed.get("has")?.split(",").filter(Boolean))?.filter((type) => VALID_HAS_TYPES.has(type));
	const params = {
		content: parsed.get("content") ?? void 0,
		author_id: parsed.get("author_id") ?? void 0,
		mentions: parsed.get("mentions") ?? void 0,
		has: validHasTypes?.length ? validHasTypes : void 0,
		min_id: parsed.get("min_id") ?? void 0,
		max_id: parsed.get("max_id") ?? void 0,
		channel_id: parsed.get("channel_id") ?? void 0,
		pinned: parsed.has("pinned") ? queryToBoolean(parsed.get("pinned")) : void 0
	};
	return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== void 0));
};
async function handler(ctx) {
	const { authorization } = config.discord || {};
	if (!authorization) throw new ConfigNotFoundError("Discord RSS is disabled due to the lack of authorization config");
	const { guildId } = ctx.req.param();
	const searchParams = parseSearchParams(ctx.req.param("routeParams"));
	if (!Object.keys(searchParams).length) throw new InvalidParameterError("At least one valid search parameter is required");
	const [guildInfo, searchResult] = await Promise.all([getGuild(guildId, authorization), searchGuildMessages(guildId, authorization, searchParams)]);
	if (!searchResult?.messages?.length) return {
		title: `Search Results - ${guildInfo.name}`,
		link: `${baseUrl}/channels/${guildId}`,
		item: [],
		allowEmpty: true
	};
	const messages = searchResult.messages.flat().map((message) => ({
		title: message.content.split("\n", 1)[0] || "(no content)",
		description: renderDescription({
			message,
			guildInfo
		}),
		author: message.author.global_name ?? message.author.username,
		pubDate: parseDate(message.timestamp),
		updated: message.edited_timestamp ? parseDate(message.edited_timestamp) : void 0,
		category: [`#${message.channel_id}`],
		link: `${baseUrl}/channels/${guildId}/${message.channel_id}/${message.id}`
	}));
	return {
		title: `Search "${Object.entries(searchParams).filter(([, value]) => value !== void 0).map(([key, value]) => `${key}:${Array.isArray(value) ? value.join(",") : value}`).join(" ")}" in ${guildInfo.name} - Discord`,
		link: `${baseUrl}/channels/${guildId}`,
		item: messages,
		allowEmpty: true
	};
}
//#endregion
export { route };
