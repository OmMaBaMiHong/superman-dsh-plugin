import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/misskey/utils.tsx
const allowSiteList = [
	"misskey.io",
	"madost.one",
	"mk.nixnet.social"
];
const renderDescription = ({ reply, text, files }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	reply ? /* @__PURE__ */ jsx("blockquote", { children: /* @__PURE__ */ jsx("p", { children: reply.text }) }) : null,
	text ? /* @__PURE__ */ jsx("p", { children: text.replaceAll("\n", "<br>") }) : null,
	(files ?? []).map((file) => /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx("br", {}),
		file.type.includes("image") ? /* @__PURE__ */ jsx("img", { src: file.url }) : file.type.includes("video") ? /* @__PURE__ */ jsx("video", {
			controls: true,
			poster: file.thumbnailUrl,
			children: /* @__PURE__ */ jsx("source", {
				src: file.url,
				type: file.type
			})
		}) : file.type.includes("audio") ? /* @__PURE__ */ jsx("audio", {
			controls: true,
			children: /* @__PURE__ */ jsx("source", {
				src: file.url,
				type: file.type
			})
		}) : /* @__PURE__ */ jsx("a", {
			href: file.url,
			target: "_blank",
			children: file.name
		}),
		file.comment ? /* @__PURE__ */ jsx("p", { children: file.comment }) : null
	] }))
] }));
const parseNotes = (data, site, simplifyAuthor = false) => data.map((item) => {
	const isRenote = item.renote && Object.keys(item.renote).length > 0;
	const isReply = item.reply && Object.keys(item.reply).length > 0;
	const noteToUse = isRenote ? item.renote : item;
	const host = noteToUse.user.host ?? site;
	const author = simplifyAuthor ? String(noteToUse.user.name) : `${noteToUse.user.name} (${noteToUse.user.username}@${host})`;
	const description = renderDescription({
		text: noteToUse.text,
		files: noteToUse.files,
		reply: item.reply
	});
	let title;
	if (isReply && item.reply) {
		const replyToHost = item.reply.user.host ?? site;
		title = `Reply to ${simplifyAuthor ? item.reply.user.name : `${item.reply.user.name} (${item.reply.user.username}@${replyToHost})`}: "${noteToUse.text ?? ""}"`;
	} else if (isRenote) title = `Renote: ${author}: "${noteToUse.text ?? ""}"`;
	else title = `${author}: "${noteToUse.text ?? ""}"`;
	/**
	* For renotes from non-Misskey instances (e.g. Mastodon, Pleroma),
	* we can't use noteToUse.id to link to the original note since:
	* 1. The URL format differs from Misskey's /notes/{id} pattern
	* 2. Direct access to the original note may not be possible
	* Therefore, we link to the renote itself in such cases
	*/
	let noteId = noteToUse.id;
	if (isRenote) {
		const renoteHost = item.user.host ?? site;
		const noteHost = noteToUse.user.host ?? site;
		if (renoteHost !== noteHost || !allowSiteList.includes(noteHost)) noteId = item.id;
	}
	const link = `https://${host}/notes/${noteId}`;
	const pubDate = parseDate(noteToUse.createdAt);
	return {
		title,
		description,
		pubDate,
		link,
		author
	};
});
async function getUserTimelineByUsername(username, site, { withRenotes = false, mediaOnly = false }) {
	const searchUrl = `https://${site}/api/users/search-by-username-and-host`;
	const cacheUid = `misskey_username/${site}/${username}`;
	const userData = await cache_default.tryGet(cacheUid, async () => {
		const user = (await got_default({
			method: "post",
			url: searchUrl,
			json: {
				username,
				host: site,
				detail: true,
				limit: 1
			}
		})).data.find((item) => item.username === username);
		if (!user) throw new Error(`username ${username} not found`);
		return user;
	});
	const accountId = userData.id;
	const avatarUrl = userData.avatarUrl;
	return {
		site,
		accountId,
		accountData: (await got_default({
			method: "post",
			url: `https://${site}/api/users/notes`,
			json: {
				userId: accountId,
				withChannelNotes: true,
				withRenotes,
				withReplies: !mediaOnly,
				withFiles: mediaOnly,
				limit: 10,
				offset: 0
			}
		})).data,
		avatarUrl
	};
}
var utils_default = {
	parseNotes,
	getUserTimelineByUsername,
	allowSiteList
};
//#endregion
export { utils_default as t };
