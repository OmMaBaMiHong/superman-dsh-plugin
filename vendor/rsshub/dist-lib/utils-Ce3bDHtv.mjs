import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/otobanana/utils.tsx
const domain = "otobanana.com";
const apiBase = `https://api.${domain}`;
const baseUrl = `https://${domain}`;
const getUserInfo = (id) => cache_default.tryGet(`otobanana:user:${id}`, async () => {
	const { data } = await got_default(`${apiBase}/users/${id}/`);
	return data;
});
const renderCast = (cast) => ({
	title: cast.title,
	description: renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx("img", { src: cast.thumbnail_url }),
		/* @__PURE__ */ jsx("br", {}),
		/* @__PURE__ */ jsx("audio", {
			controls: true,
			children: /* @__PURE__ */ jsx("source", {
				src: cast.audio_url,
				type: "audio/x-m4a"
			})
		}),
		/* @__PURE__ */ jsx("br", {}),
		`💬 ${cast.comment_count} ❤️ ${cast.like_count} 🍌 ${cast.gift_banana} ${cast.play_count} 再生`,
		/* @__PURE__ */ jsx("br", {}),
		cast.text ? raw(cast.text.replaceAll("\n", "<br>")) : null
	] })),
	pubDate: parseDate(cast.created_at),
	link: `https://otobanana.com/cast/${cast.id}`,
	author: `${cast.user.name} (@${cast.user.username})`,
	itunes_item_image: cast.thumbnail_url,
	itunes_duration: cast.duration_time,
	enclosure_url: cast.audio_url,
	enclosure_type: "audio/x-m4a",
	upvotes: cast.like_count,
	comments: cast.comment_count
});
const renderLive = (live) => ({
	title: live.title,
	description: live.is_open ? "配信中のライブ" : "終了しました",
	pubDate: parseDate(live.created_at),
	link: live.room_url,
	guid: `${live.room_url}#${live.id}`,
	author: `${live.user.name} (@${live.user.username})`,
	upvotes: live.like_count,
	comments: live.comment_count
});
const renderPost = ({ id, type_label: type, cast, message }) => {
	switch (type) {
		case "cast": return renderCast(cast);
		case "message": return {
			title: message.text.split("\n", 1)[0],
			description: message.text.replaceAll("\n", "<br>"),
			pubDate: parseDate(message.created_at),
			link: `https://otobanana.com/${type}/${id}`,
			author: `${message.user.name} (@${message.user.username})`,
			upvotes: message.like_count,
			comments: message.comment_count
		};
		default: throw new Error(`Unknown post type: ${type}`);
	}
};
//#endregion
export { renderLive as a, renderCast as i, baseUrl as n, renderPost as o, getUserInfo as r, apiBase as t };
