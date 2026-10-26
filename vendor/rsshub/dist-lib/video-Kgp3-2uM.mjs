import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { jsx } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/manyvids/video.tsx
const route = {
	path: "/profile/vids/:uid",
	radar: [{ source: ["www.manyvids.com/Profile/:uid/:handle/Store/*", "www.manyvids.com/Profile/:uid/:handle/Store"] }],
	parameters: { uid: "User ID, can be found in the URL." },
	name: "Creator Videos",
	example: "/manyvids/profile/vids/1001213004",
	maintainers: ["TonyRL"],
	handler,
	features: { nsfw: true }
};
const getProfileById = (uid) => cache_default.tryGet(`manyvids:profile:${uid}`, () => rofetch(`https://www.manyvids.com/bff/profile/profiles/${uid}`));
const render = ({ poster, src }) => renderToString(/* @__PURE__ */ jsx("video", {
	controls: true,
	preload: "metadata",
	poster,
	children: /* @__PURE__ */ jsx("source", {
		src,
		type: "video/mp4"
	})
}));
async function handler(ctx) {
	const { uid } = ctx.req.param();
	const profile = await getProfileById(uid);
	const items = (await rofetch(`https://www.manyvids.com/bff/store/videos/${uid}/`, { query: { page: 1 } })).data.map((v) => ({
		title: v.title,
		link: `https://www.manyvids.com/Video/${v.id}/${v.slug}`,
		author: v.creator.stageName,
		description: render({
			poster: v.thumbnail.url,
			src: v.preview.url
		})
	}));
	return {
		title: `${profile.displayName}'s Profile - Porn vids, Pics & More | ManyVids - ManyVids`,
		link: `https://www.manyvids.com/Profile/${uid}/${profile.urlHandle}/Store/Videos`,
		image: profile.avatar,
		description: profile.bio,
		item: items
	};
}
//#endregion
export { route };
