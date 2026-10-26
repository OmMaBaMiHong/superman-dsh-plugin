import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { a as unwrapMedia, n as getDocument, r as getFilename, t as getClient } from "./client-CpemqeNr.mjs";
import { Api } from "telegram";
import { returnBigInt } from "telegram/Helpers.js";
import { getDisplayName } from "telegram/Utils.js";
import { HTMLParser } from "telegram/extensions/html.js";
//#region lib/routes/telegram/tglib/channel.ts
function getGeoLink(geo) {
	return `<a href="https://www.google.com/maps/search/?api=1&query=${geo.lat}%2C${geo.long}" target="_blank">Geo LatLon: ${geo.lat}, ${geo.long}</a>`;
}
async function getPollResults(client, message, m) {
	const resultsUpdateResponse = await client.invoke(new Api.messages.GetPollResults({
		peer: message.peerId,
		msgId: message.id
	}));
	let results;
	if (resultsUpdateResponse?.updates[0] instanceof Api.UpdateMessagePoll) results = resultsUpdateResponse.updates[0].results;
	return `<h4>${m.poll.quiz ? "Quiz" : "Poll"}: ${m.poll.question.text}</h4>
        <div><ul>${m.poll.answers.map((a) => {
		let answerTxt = a.text.text;
		const result = results.results?.find((r) => r.option.buffer === a.option.buffer);
		if (result && results.totalVoters) answerTxt = `<strong>${Math.round(result.voters / results.totalVoters * 100)}%</strong>: ${answerTxt}`;
		return `<li>${answerTxt}</li>`;
	}).join("")}</ul></div>
    `;
}
function withSearchParams(src, params) {
	const url = new URL(src);
	for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
	return url.href;
}
function getMessageMediaUrl(requestUrl, username, messageId) {
	const request = new URL(requestUrl);
	const url = new URL(`/telegram/media/${username}/${messageId}`, request.origin);
	for (const key of ["key", "code"]) {
		const value = request.searchParams.get(key);
		if (value) url.searchParams.set(key, value);
	}
	return url.href;
}
function getMediaLink(src, m) {
	const doc = getDocument(m);
	const mime = doc ? doc.mimeType : "";
	if (m instanceof Api.MessageMediaPhoto || mime.startsWith("image/")) return `<img src="${src}" alt=""/>`;
	if (doc && mime.startsWith("video/")) {
		const vid = doc.attributes.find((t) => t instanceof Api.DocumentAttributeVideo) ?? {
			w: 1080,
			h: 720
		};
		return `<video controls preload="metadata" poster="${withSearchParams(src, { thumb: "" })}" width="${vid.w / 2}" height="${vid.h / 2}"><source src="${src}" type="${mime}"></video>`;
	}
	if (doc && mime.startsWith("audio/")) return `<div>${getAudioTitle(m)}</div><div><audio src="${src}"></audio></div>`;
	if (doc && mime.startsWith("application/")) {
		let linkText = `${getFilename(m)} (${humanFileSize(doc.size.valueOf())})`;
		if (mime.endsWith("x-tgsticker")) linkText = "";
		if ((doc.thumbs?.length ?? 0) > 0) linkText = `<div><img src="${withSearchParams(src, { thumb: "" })}" alt=""/></div><div>${linkText}</div>`;
		return `<a href="${src}" target="_blank">${linkText}</a>`;
	}
	if ((m instanceof Api.MessageMediaGeo || m instanceof Api.MessageMediaGeoLive) && m.geo instanceof Api.GeoPoint) return getGeoLink(m.geo);
	if (m instanceof Api.MessageMediaWebPage) return "";
	if (m instanceof Api.MessageMediaContact) return `Contact: <a href="tel:${m.phoneNumber}" target="_blank">${m.firstName} ${m.lastName} ${m.phoneNumber}</a>`;
	if (m instanceof Api.MessageMediaInvoice) {
		let description = m.description;
		if (m.photo?.url) description = `<img src="${m.photo?.url}" /><br />${description}`;
		return `<h4>${m.test ? "TEST " : ""}Invoice: ${m.title}</h4><div>${description}</div>`;
	}
	return m.className;
}
function humanFileSize(size) {
	const i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
	return (size / Math.pow(1024, i)).toFixed(2) + " " + [
		"B",
		"kB",
		"MB",
		"GB",
		"TB"
	][i];
}
function getAudioTitle(x) {
	if (x instanceof Api.MessageMediaDocument && x.document instanceof Api.Document) {
		const attr = x.document.attributes.find((x) => x instanceof Api.DocumentAttributeAudio);
		if (attr) return `${attr.performer} - ${attr.title} (${humanDuration(attr.duration)})`;
	}
	return getFilename(x);
}
function humanDuration(seconds) {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor(seconds % 3600 / 60);
	const remainingSeconds = seconds % 60;
	const paddedMinutes = String(minutes).padStart(2, "0");
	const paddedSeconds = String(remainingSeconds).padStart(2, "0");
	if (hours > 0) return `${hours}:${paddedMinutes}:${paddedSeconds}`;
	if (minutes > 0) return `${minutes}:${paddedSeconds}`;
	return `0:${paddedSeconds}`;
}
async function handler(ctx) {
	const client = await getClient();
	const username = ctx.req.param("username");
	let peerCache = await cache_default.get(`telegram:inputEntity:${username}`);
	if (!peerCache) {
		const p = await client.getInputEntity(username);
		peerCache = JSON.stringify(p.toJSON());
		await cache_default.set(`telegram:inputEntity:${username}`, peerCache);
	}
	const peerData = JSON.parse(peerCache, (k, v) => k === "channelId" || k === "accessHash" ? returnBigInt(v) : v);
	const peer = new Api.InputPeerChannel(peerData);
	const entity = await client.getEntity(peer);
	let attachments = [];
	const messages = await client.getMessages(peer, { limit: 50 });
	let i = 0;
	const item = [];
	for (const message of messages) {
		let text = message.text;
		if (message.fwdFrom?.fromId) text = `Forwarded From: ${getDisplayName(await client.getEntity(message.fwdFrom.fromId))}: ${text}`;
		const media = await unwrapMedia(message.media, message.peerId);
		if (message.media instanceof Api.MessageMediaStory && media) text = `Story From: ${getDisplayName(await client.getEntity(message.media.peer))}: ${text}`;
		if (media) {
			if (media instanceof Api.MessageMediaPoll) {
				attachments.push(await getPollResults(client, message, media));
				continue;
			}
			const src = getMessageMediaUrl(ctx.req.url, username, message.id);
			attachments.push(getMediaLink(src, media));
		}
		if (message.replyMarkup instanceof Api.ReplyInlineMarkup) {
			for (const buttonRow of message.replyMarkup.rows) for (const button of buttonRow.buttons) if (button instanceof Api.KeyboardButtonUrl) attachments.push(`<div><a href="${button.url}" target="_blank">${button.text}</a></div>`);
		}
		if (text !== "" || ++i === messages.length - 1) {
			let description = attachments.join("<br/>\n");
			attachments = [];
			if (text) description += `<p>${HTMLParser.unparse(message.message, message.entities).replaceAll("\n", "<br/>")}</p>`;
			const title = message.text ? message.text.slice(0, 80) + (message.text.length > 80 ? "..." : "") : (/* @__PURE__ */ new Date(message.date * 1e3)).toUTCString();
			item.push({
				title,
				description,
				pubDate: (/* @__PURE__ */ new Date(message.date * 1e3)).toUTCString(),
				link: `https://t.me/s/${username}/${message.id}`,
				author: getDisplayName(message.sender ?? entity)
			});
		}
	}
	return {
		title: getDisplayName(entity),
		language: null,
		link: `https://t.me/${username}`,
		item,
		allowEmpty: ctx.req.param("id") === "allow_empty",
		description: `@${username} on Telegram`
	};
}
//#endregion
export { getMediaLink as n, handler as r, getGeoLink as t };
