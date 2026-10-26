import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/163/music/userplaylist.tsx
const renderDescription = (image, description, src) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	image ? /* @__PURE__ */ jsx("img", { src: image }) : null,
	description?.length ? /* @__PURE__ */ jsx("div", { children: description.map((line) => /* @__PURE__ */ jsx("p", { children: line })) }) : null,
	src ? /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("a", {
		href: src,
		children: "查看歌单"
	}) }) : null
] }));
const route = {
	path: "/music/user/playlist/:uid",
	categories: ["multimedia"],
	example: "/163/music/user/playlist/45441555",
	parameters: { uid: "用户 uid, 可在用户主页 URL 中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "用户歌单",
	maintainers: ["DIYgod"],
	handler
};
async function handler(ctx) {
	const uid = ctx.req.param("uid");
	const response = await got_default.post("https://music.163.com/api/user/playlist", {
		headers: { Referer: "https://music.163.com/" },
		form: {
			uid,
			limit: 1e3,
			offset: 0
		}
	});
	const playlist = response.data.playlist || [];
	const { nickname, signature, avatarUrl } = (playlist[0] || {}).creator;
	return {
		title: `${nickname} 的所有歌单`,
		link: `https://music.163.com/user/home?id=${uid}`,
		subtitle: signature,
		description: signature,
		author: nickname,
		updated: response.headers.date,
		icon: avatarUrl,
		image: avatarUrl,
		item: playlist.map((pl) => {
			const src = `http://music.163.com/playlist/${pl.id}`;
			const html = renderDescription(pl.coverImgUrl, (pl.description || "").split("\n"), src);
			return {
				title: pl.name,
				link: src,
				pubDate: new Date(pl.createTime).toUTCString(),
				published: new Date(pl.createTime).toISOString(),
				updated: new Date(pl.updateTime).toISOString(),
				author: pl.creator.nickname,
				description: html,
				content: { html },
				category: pl.tags
			};
		})
	};
}
//#endregion
export { route };
