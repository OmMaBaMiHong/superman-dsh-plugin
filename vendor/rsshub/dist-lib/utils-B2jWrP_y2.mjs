import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/skeb/utils.tsx
const baseUrl = "https://skeb.jp";
function processWork(work) {
	if (!work || typeof work !== "object" || work.private === true) return null;
	const imageUrl = work.thumbnail_image_urls?.srcset?.split(",").pop()?.trim().split(" ", 1)[0] || "";
	const body = work.body || "";
	const audioUrl = work.genre === "music" || work.genre === "voice" ? work.preview_url : null;
	const renderedHtml = renderToString(/* @__PURE__ */ jsx(SkebWorkDescription, {
		imageUrl,
		body,
		audioUrl
	}));
	return {
		title: work.path || "",
		link: `${baseUrl}${work.path || ""}`,
		description: renderedHtml
	};
}
const skillMap = {
	art: "Illust",
	voice: "Voice",
	novel: "Novel",
	video: "Video",
	music: "Music",
	correction: "Advice",
	comic: "Comic"
};
function processCreator(creator) {
	if (!creator || typeof creator !== "object") return null;
	const avatarUrl = creator.avatar_url || "";
	let renderedHtml;
	if (creator.creator) {
		const acceptingCommissions = creator.acceptable ? "Yes" : "No";
		const nsfwAcceptable = creator.nsfw_acceptable ? "Yes" : "No";
		let skills = "";
		if (Array.isArray(creator.skills) && creator.skills.length > 0) skills = creator.skills.map((skill) => skillMap[skill.genre] || skill.genre).filter(Boolean).join(", ");
		renderedHtml = renderToString(/* @__PURE__ */ jsx(SkebCreatorDescription, {
			avatarUrl,
			acceptingCommissions,
			nsfwAcceptable,
			skills
		}));
	}
	return {
		title: creator.name || "",
		link: `${baseUrl}/@${creator.screen_name || ""}`,
		description: renderedHtml
	};
}
async function getFollowingsItems(username, path) {
	const url = `${baseUrl}/api/users/${username.replace("@", "")}/followings`;
	const followings_data = await cache_default.tryGet(`skeb:followings_data:${username}`, async () => {
		return await rofetch(url, { headers: { Authorization: `Bearer ${config.skeb.bearerToken}` } });
	}, config.cache.routeExpire, false);
	if (!followings_data || typeof followings_data !== "object") throw new Error("Failed to fetch followings data");
	if (path === "following_creators") return followings_data[path].map((item) => processCreator(item)).filter(Boolean);
	return followings_data[path].map((item) => processWork(item)).filter(Boolean);
}
const SkebWorkDescription = ({ imageUrl, body, audioUrl }) => /* @__PURE__ */ jsxs(Fragment, { children: [
	imageUrl ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", { src: imageUrl }), /* @__PURE__ */ jsx("br", {})] }) : null,
	audioUrl ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("audio", {
		controls: true,
		children: [/* @__PURE__ */ jsx("source", {
			src: audioUrl,
			type: "audio/mp3"
		}), "Your browser does not support the audio element."]
	}), /* @__PURE__ */ jsx("br", {})] }) : null,
	body
] });
const SkebCreatorDescription = ({ avatarUrl, acceptingCommissions, nsfwAcceptable, skills }) => /* @__PURE__ */ jsxs(Fragment, { children: [
	avatarUrl ? /* @__PURE__ */ jsx("img", { src: avatarUrl }) : null,
	/* @__PURE__ */ jsxs("p", { children: ["委託狀況（Accepting Commissions）：", acceptingCommissions] }),
	/* @__PURE__ */ jsxs("p", { children: ["NSFW：", nsfwAcceptable] }),
	skills ? /* @__PURE__ */ jsxs("p", { children: ["類型（Genre）：", skills] }) : null
] });
//#endregion
export { processWork as i, getFollowingsItems as n, processCreator as r, baseUrl as t };
