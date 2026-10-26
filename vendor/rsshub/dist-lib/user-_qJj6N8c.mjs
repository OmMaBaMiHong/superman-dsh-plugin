import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
//#region lib/routes/fantia/user.ts
const route = {
	path: "/user/:id",
	categories: ["picture"],
	view: 2,
	example: "/fantia/user/3498",
	parameters: { id: "User id, can be found in user profile URL" },
	features: {
		requireConfig: [{
			name: "FANTIA_COOKIE",
			optional: true,
			description: "The `cookie` after login can be obtained by viewing the request header in the console, If not filled in will cause some posts that require login to read to get exceptions"
		}],
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	radar: [{ source: ["fantia.jp/fanclubs/:id"] }],
	name: "User Posts",
	maintainers: ["nczitzk"],
	handler
};
async function handler(ctx) {
	const rootUrl = "https://fantia.jp";
	const userUrl = `${rootUrl}/api/v1/fanclubs/${ctx.req.param("id")}`;
	const csrfToken = (await rofetch(rootUrl, { headers: { Cookie: config.fantia.cookies ?? "" } })).match(/name="csrf-token" content="(.*?)"\s?\/>/)[1];
	const response = await rofetch(userUrl, { headers: { Cookie: config.fantia.cookies ?? "" } });
	const fanClub = response.fanclub;
	const list = response.fanclub.recent_posts.map((item) => ({
		title: item.title,
		link: `${rootUrl}/api/v1/posts/${item.id}`,
		description: item.comment ? `<p>${item.comment}</p>` : "",
		pubDate: parseDate(item.posted_at)
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const contentResponse = await rofetch(item.link, { headers: {
			Cookie: config.fantia.cookies ?? "",
			"X-CSRF-Token": csrfToken,
			Accept: "application/json, text/plain, */*",
			Referer: `${rootUrl}/`,
			"X-Requested-With": "XMLHttpRequest"
		} });
		item.link = item.link.replace("api/v1/", "");
		item.description += `<img src="${contentResponse.post?.thumb?.original ?? contentResponse.post.thumb_micro}">`;
		return item;
	})));
	return {
		title: `Fantia - ${fanClub.fanclub_name_with_creator_name}`,
		description: fanClub.comment?.replaceAll("\r\n", " ")?.trim(),
		link: `${rootUrl}/fanclubs/${ctx.req.param("id")}`,
		image: fanClub.icon.original ?? fanClub.icon.main,
		item: items
	};
}
//#endregion
export { route };
