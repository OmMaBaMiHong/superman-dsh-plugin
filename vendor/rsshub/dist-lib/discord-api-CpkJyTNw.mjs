import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import crypto from "node:crypto";
//#region lib/routes/discord/discord-api.ts
const baseUrl = "https://discord.com";
const apiUrl = `${baseUrl}/api/v10`;
const getGuild = (guildId, authorization) => cache_default.tryGet(`discord:guilds:${guildId}`, () => rofetch(`${apiUrl}/guilds/${guildId}`, { headers: { authorization } }));
const getChannel = (channelId, authorization) => cache_default.tryGet(`discord:channels:${channelId}`, () => rofetch(`${apiUrl}/channels/${channelId}`, { headers: { authorization } }));
const getChannelMessages = (channelId, authorization, limit = 100) => cache_default.tryGet(`discord:channels:${channelId}:messages`, () => rofetch(`${apiUrl}/channels/${channelId}/messages`, {
	headers: { authorization },
	query: { limit }
}), config.cache.routeExpire, false);
const VALID_HAS_TYPES = /* @__PURE__ */ new Set([
	"link",
	"embed",
	"poll",
	"file",
	"video",
	"image",
	"sound",
	"sticker",
	"snapshot"
]);
const searchGuildMessages = (guildId, authorization, params) => cache_default.tryGet(`discord:guilds:${guildId}:search:${JSON.stringify(params)}`, () => {
	const queryParams = {
		...params,
		has: params.has?.length ? params.has : void 0
	};
	return rofetch(`${apiUrl}/guilds/${guildId}/messages/search`, {
		headers: { authorization },
		query: queryParams
	});
}, config.cache.routeExpire, false);
const getQuests = (authorization) => cache_default.tryGet("discord:quests", () => {
	const superProperties = JSON.stringify({
		os: "Windows",
		browser: "Chrome",
		device: "",
		system_locale: "en-GB",
		has_client_mods: false,
		browser_user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
		browser_version: "120.0",
		os_version: "10",
		referrer: "",
		referring_domain: "",
		referrer_current: "",
		referring_domain_current: "",
		release_channel: "stable",
		client_build_number: Math.floor(Math.random() * 100001) + 4e5,
		client_event_source: null,
		client_launch_id: crypto.randomUUID(),
		client_app_state: "unfocused"
	});
	return rofetch(`${apiUrl}/quests/@me`, { headers: {
		authorization,
		"X-Super-Properties": Buffer.from(superProperties).toString("base64")
	} });
}, config.cache.routeExpire, false);
//#endregion
export { getGuild as a, getChannelMessages as i, baseUrl as n, getQuests as o, getChannel as r, searchGuildMessages as s, VALID_HAS_TYPES as t };
