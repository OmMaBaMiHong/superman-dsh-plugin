import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { a as rootUrl, i as parseThumbnail, o as typeMap, t as apiRootUrl } from "./utils-CKGISivV2.mjs";
//#region lib/routes/iwara/index.ts
const apiUrlMap = {
	video: `${apiRootUrl}/videos`,
	image: `${apiRootUrl}/images`
};
const route = {
	path: "/users/:username/:type?",
	example: "/iwara/users/kelpie/video",
	parameters: {
		username: "username, can find in userpage",
		type: "content type, can be video or image, default is video"
	},
	name: "User",
	maintainers: ["Fatpandac"],
	handler,
	features: { nsfw: true }
};
async function handler(ctx) {
	const { username, type = "video" } = ctx.req.param();
	const id = (await cache_default.tryGet(`${apiRootUrl}/profile/${username}`, async () => {
		return (await rofetch(`${apiRootUrl}/profile/${username}`, { headers: { "user-agent": config.trueUA } })).user;
	})).id;
	const items = (await cache_default.tryGet(`${apiUrlMap[type]}?user=${id}`, async () => {
		return (await rofetch(`${apiUrlMap[type]}?user=${id}`, { headers: { "user-agent": config.trueUA } })).results;
	}, config.cache.routeExpire, false)).map((item) => ({
		title: item.title,
		author: username,
		link: `${rootUrl}/${type}/${item.id}/${item.slug}`,
		category: item.tags.map((i) => i.id),
		description: parseThumbnail(type, item),
		pubDate: parseDate(item.createdAt)
	}));
	return {
		title: `${username}'s iwara - ${typeMap[type]}`,
		link: `${rootUrl}/users/${username}`,
		item: items
	};
}
//#endregion
export { route };
