import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/myfans/utils.ts
const apiBaseUrl = "https://api.myfans.jp";
const baseUrl = "https://myfans.jp";
const headers = { "google-ga-data": "event328" };
const showByUsername = (username) => cache_default.tryGet(`myfans:account:${username}`, async () => {
	const accountInfo = await rofetch(`${apiBaseUrl}/api/v2/users/show_by_username`, {
		headers,
		query: { username }
	});
	if (!accountInfo.id) throw new InvalidParameterError("This creator does not exist.");
	return accountInfo;
});
const getPostByAccountId = async (accountId) => {
	return (await rofetch(`${apiBaseUrl}/api/v2/users/${accountId}/posts`, {
		headers,
		query: {
			sort_key: "publish_start_at",
			page: 1
		}
	})).data;
};
//#endregion
//#region lib/routes/myfans/post.tsx
const route = {
	path: "/user/:username",
	categories: ["multimedia"],
	example: "/myfans/user/secret_japan",
	parameters: { username: "User handle" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	radar: [{ source: ["myfans.jp/:username", "myfans.jp/:language/:username"] }],
	name: "User Posts",
	maintainers: ["TonyRL"],
	handler
};
const renderDescription = (postImages, body) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [postImages ? postImages.map((image) => /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", { src: image.file_url }), /* @__PURE__ */ jsx("br", {})] })) : null, body ? raw(body) : null] }));
async function handler(ctx) {
	const { username } = ctx.req.param();
	const account = await showByUsername(username);
	const items = (await getPostByAccountId(account.id)).map((p) => ({
		title: p.body?.replaceAll("\r\n", " ").trim().split(" ", 1)[0],
		description: renderDescription(p.post_images, p.body?.replaceAll("\r\n", "<br>")),
		pubDate: parseDate(p.published_at),
		link: `${baseUrl}/posts/${p.id}`,
		author: p.user.name
	}));
	return {
		title: `${account.name} (@${account.username})`,
		link: `${baseUrl}/${account.username}`,
		description: `${account.posts_count} Post ${account.likes_count} Like ${account.followers_count}
Followers ${account.followings_count} Follow ${account.about.replaceAll("\r\n", " ")}`,
		image: account.avatar_url,
		icon: account.avatar_url,
		logo: account.avatar_url,
		language: "ja-JP",
		item: items
	};
}
//#endregion
export { route };
