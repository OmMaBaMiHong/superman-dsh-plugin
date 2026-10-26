import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/rattibha/user.tsx
const route = {
	path: "/user/:user",
	categories: ["social-media"],
	example: "/rattibha/user/elonmusk",
	parameters: { user: "Twitter username, without @" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["rattibha.com/:user"] }],
	name: "User Threads",
	maintainers: ["yshalsager"],
	handler
};
async function handler(ctx) {
	const baseUrl = "https://rattibha.com";
	const { user: twitterUser } = ctx.req.param();
	const userData = await cache_default.tryGet(`rattibha:user:${twitterUser}`, async () => {
		return (await rofetch(`${baseUrl}/user`, { query: { id: twitterUser } })).user;
	});
	const items = (await cache_default.tryGet(`rattibha:userThreads:${twitterUser}`, () => rofetch(`${baseUrl}/u_threads`, { query: {
		id: userData.account_user_id,
		page: 0,
		post_type: 0
	} }), config.cache.routeExpire, false)).map((item) => ({
		title: item.thread.t.info.text.split("\n", 1)[0],
		link: `${baseUrl}/thread/${item.thread_id}`,
		pubDate: parseDate(item.thread.created_at),
		updated: parseDate(item.thread.updated_at),
		author: userData.name,
		category: item.thread.categories.map((category) => category.tag.name),
		description: renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [item.thread.m ? /* @__PURE__ */ jsxs(Fragment, { children: [item.thread.m.type === 1 ? /* @__PURE__ */ jsx("video", {
			controls: true,
			preload: "metadata",
			poster: item.thread.m.picture_url,
			children: /* @__PURE__ */ jsx("source", {
				src: item.thread.m.video_url,
				type: "video/mp4"
			})
		}) : item.thread.m.type === 2 ? /* @__PURE__ */ jsx("img", { src: item.thread.m.picture_url }) : null, /* @__PURE__ */ jsx("br", {})] }) : null, raw(item.thread.t.info.text.replaceAll("\n", "<br>"))] }))
	}));
	return {
		title: `سلاسل تغريدات ${twitterUser}`,
		link: `${baseUrl}/${twitterUser}`,
		item: items
	};
}
//#endregion
export { route };
