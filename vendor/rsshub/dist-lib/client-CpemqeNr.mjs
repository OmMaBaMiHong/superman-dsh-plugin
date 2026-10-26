import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
//#region lib/routes/telegram/tglib/client.ts
let client;
async function getClient(authParams, session) {
	if (!config.telegram.session && session === void 0) throw new ConfigNotFoundError("TELEGRAM_SESSION is not configured");
	if (client) return client;
	const apiId = Number(config.telegram.apiId ?? 4);
	const apiHash = config.telegram.apiHash ?? "014b35b6184100b085b0d0572f9b5103";
	client = new TelegramClient(new StringSession(session ?? config.telegram.session), apiId, apiHash, {
		connectionRetries: Infinity,
		autoReconnect: true,
		retryDelay: 3e3,
		maxConcurrentDownloads: Number(config.telegram.maxConcurrentDownloads ?? 10),
		proxy: config.telegram.proxy?.host && config.telegram.proxy.port && config.telegram.proxy.secret ? {
			ip: config.telegram.proxy.host,
			port: Number(config.telegram.proxy.port),
			MTProxy: true,
			secret: config.telegram.proxy.secret
		} : void 0
	});
	await client.start(Object.assign(authParams ?? {}, { onError: (err) => {
		throw new Error("Cannot start TG: " + err);
	} }));
	return client;
}
function getFilename(x) {
	if (x instanceof Api.MessageMediaDocument) {
		for (const a of x.document.attributes) if (a instanceof Api.DocumentAttributeFilename) return a.fileName;
	}
	return x.className;
}
function getDocument(m) {
	if (m instanceof Api.MessageMediaDocument && m.document && !(m.document instanceof Api.DocumentEmpty)) return m.document;
	if (m instanceof Api.MessageMediaWebPage && m.webpage instanceof Api.WebPage && m.webpage.document instanceof Api.Document) return m.webpage.document;
}
async function getStory(entity, id) {
	return (await (await getClient()).invoke(new Api.stories.GetStoriesByID({
		id: [id],
		peer: entity
	}))).stories[0];
}
async function unwrapMedia(media, backupPeerId) {
	if (media instanceof Api.MessageMediaStory) {
		if (media.story instanceof Api.StoryItem && media.story.media) return media.story.media;
		let storyItem = await getStory(media.peer, media.id);
		if (!storyItem?.media && backupPeerId) storyItem = await getStory(backupPeerId, media.id);
		return storyItem?.media;
	}
	return media;
}
//#endregion
export { unwrapMedia as a, getStory as i, getDocument as n, getFilename as r, getClient as t };
