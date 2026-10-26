import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { n as renderVideo, r as renderImages, t as renderItems } from "./common-utils-fguPekVT.mjs";
import { CookieJar } from "tough-cookie";
//#region lib/routes/instagram/web-api/utils.ts
const baseUrl = "https://www.instagram.com";
const COOKIE_URL = baseUrl;
const getCSRFTokenFromJar = async (cookieJar) => {
	return (await cookieJar.getCookieString(COOKIE_URL)).match(/csrftoken=([^;]+)/)?.[1];
};
const getHeaders = async (cookieJar) => ({
	"sec-fetch-dest": "empty",
	"sec-fetch-mode": "cors",
	"sec-fetch-site": "same-origin",
	"x-asbd-id": 359341,
	"x-csrftoken": await getCSRFTokenFromJar(cookieJar),
	"x-ig-app-id": 936619743392459,
	"x-ig-www-claim": "0"
});
const checkLogin = async (cookieJar) => {
	return (await rofetch(`${baseUrl}/api/v1/web/fxcal/ig_sso_users/`, {
		headers: {
			"content-type": "application/x-www-form-urlencoded",
			cookie: await cookieJar.getCookieString(COOKIE_URL),
			...await getHeaders(cookieJar)
		},
		method: "POST"
	})).status === "ok";
};
const getUserInfo = async (username, cookieJar) => {
	let webProfileInfo;
	let id = await cache_default.get(`instagram:getIdByUsername:${username}`);
	let userInfoCache = await cache_default.get(`instagram:userInfo:${id}`);
	userInfoCache = userInfoCache && typeof userInfoCache === "string" ? JSON.parse(userInfoCache) : userInfoCache;
	if (!userInfoCache) try {
		const response = await rofetch.raw(`${baseUrl}/api/v1/users/web_profile_info/`, {
			headers: {
				cookie: await cookieJar.getCookieString(COOKIE_URL),
				...await getHeaders(cookieJar)
			},
			query: { username }
		});
		if (response.url.includes("/accounts/login/")) throw new ConfigNotFoundError("Invalid cookie");
		webProfileInfo = response._data.data.user;
		id = webProfileInfo.id;
		await cache_default.set(`instagram:getIdByUsername:${username}`, id, 31536e3);
		await cache_default.set(`instagram:userInfo:${id}`, webProfileInfo);
	} catch (error) {
		if (error.message.includes("Cookie not in this host's domain")) throw new ConfigNotFoundError("Invalid cookie");
		throw error;
	}
	return userInfoCache || webProfileInfo;
};
const getUserFeedItems = (id, username, cookieJar) => cache_default.tryGet(`instagram:feed:${id}`, async () => {
	const response = await rofetch.raw(`${baseUrl}/api/v1/feed/user/${username}/username/`, {
		headers: {
			cookie: await cookieJar.getCookieString(COOKIE_URL),
			...await getHeaders(cookieJar)
		},
		query: { count: 30 }
	});
	if (response.url.includes("/accounts/login/")) throw new ConfigNotFoundError(`Invalid cookie.
                Please also check if your account is being blocked by Instagram.`);
	return response._data.items;
}, config.cache.routeExpire, false);
const getTagsFeed = (tag, cookieJar) => cache_default.tryGet(`instagram:tags:${tag}`, async () => {
	return (await rofetch(`${baseUrl}/api/v1/tags/web_info/`, {
		headers: {
			cookie: await cookieJar.getCookieString(COOKIE_URL),
			...await getHeaders(cookieJar)
		},
		query: { tag_name: tag }
	})).data;
}, config.cache.routeExpire, false);
const renderGuestItems = (items) => {
	const renderVideoItem = (node, summary) => renderVideo({
		summary,
		image: node.display_url,
		video: {
			url: node.video_url,
			height: node.dimensions.height,
			width: node.dimensions.width
		}
	});
	const renderImagesItem = (node, summary) => renderImages({
		summary,
		images: [{
			url: node.display_url,
			height: node.dimensions.height,
			width: node.dimensions.width
		}]
	});
	return items.map(({ node }) => {
		const type = node.__typename;
		const summary = node.edge_media_to_caption.edges[0]?.node.text ?? "";
		let description;
		switch (type) {
			case "GraphSidecar":
				description = node.edge_sidecar_to_children ? node.edge_sidecar_to_children.edges.map(({ node }, i) => {
					const _type = node.__typename;
					switch (_type) {
						case "GraphVideo": return renderVideoItem(node, i === 0 ? summary : "");
						case "GraphImage": return renderImagesItem(node, i === 0 ? summary : "");
						default: throw new Error(`Instagram: Unhandled carousel type: ${_type}`);
					}
				}).join("") : renderImages(node, summary);
				break;
			case "GraphVideo":
				description = renderVideoItem(node, summary);
				break;
			case "GraphImage":
				description = renderImagesItem(node, summary);
				break;
			default: throw new Error(`Instagram: Unhandled feed type: ${type}`);
		}
		return {
			title: summary.split("\n", 1)[0],
			id: node.id,
			pubDate: parseDate(node.taken_at_timestamp, "X"),
			author: node.owner.username,
			link: `${baseUrl}/p/${node.shortcode}/`,
			summary,
			description
		};
	});
};
//#endregion
//#region lib/routes/instagram/web-api/index.ts
const route = {
	path: "/2/:category/:key",
	categories: ["social-media"],
	example: "/instagram/2/user/stefaniejoosten",
	parameters: {
		category: "Feed category, see table below",
		key: "Username / Hashtag name"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "User Profile / Hashtag",
	maintainers: ["TonyRL"],
	handler,
	description: `::: tip
You may need to setup cookie for a less restrictive rate limit and private profiles.
:::

| User timeline | Hashtag |
| ------------- | ------- |
| user          | tags    |`
};
async function handler(ctx) {
	const availableCategories = ["user", "tags"];
	const { category, key } = ctx.req.param();
	const { cookie } = config.instagram;
	if (!availableCategories.includes(category)) throw new InvalidParameterError("Such feed is not supported.");
	let cookieJar = await cache_default.get("instagram:cookieJar");
	if (!cookieJar) {
		cookieJar = new CookieJar();
		if (cookie) for await (const c of cookie.split("; ")) await cookieJar.setCookie(c, COOKIE_URL);
	} else cookieJar = CookieJar.fromJSON(cookieJar);
	if (cookie && !await checkLogin(cookieJar)) throw new ConfigNotFoundError("Invalid cookie");
	let feedTitle, feedLink, feedDescription, feedLogo;
	let items;
	switch (category) {
		case "user": {
			const userInfo = await getUserInfo(key, cookieJar);
			const biography = userInfo.biography;
			const fullName = userInfo.full_name;
			const id = userInfo.id;
			const username = userInfo.username;
			feedTitle = `${fullName} (@${username}) - Instagram`;
			feedDescription = biography;
			feedLogo = userInfo.profile_pic_url_hd ?? userInfo.hd_profile_pic_url_info?.url ?? userInfo.profile_pic_url;
			feedLink = `${baseUrl}/${username}`;
			items = cookie ? await getUserFeedItems(id, username, cookieJar) : [...userInfo.edge_felix_video_timeline.edges, ...userInfo.edge_owner_to_timeline_media.edges];
			break;
		}
		case "tags": {
			if (!config.instagram || !config.instagram.cookie) throw new ConfigNotFoundError("Instagram RSS is disabled due to the lack of <a href=\"https://docs.rsshub.app/deploy/config#route-specific-configurations\">relevant config</a>");
			const tag = key;
			feedTitle = `#${tag} - Instagram`;
			feedLink = `${baseUrl}/explore/search/keyword/?q=%23${tag}`;
			const feedData = await getTagsFeed(tag, cookieJar);
			feedLogo = feedData.profile_pic_url;
			items = feedData.top.sections.flatMap((section) => (section.feed_type === "media" ? section.layout_content.medias : [...section.layout_content.one_by_two_item.clips.items, ...section.layout_content.fill_items]).map((item) => item.media));
			break;
		}
		default: break;
	}
	await cache_default.set("instagram:cookieJar", cookieJar.toJSON(), 31536e3);
	return {
		title: feedTitle,
		link: feedLink,
		description: feedDescription,
		item: cookie ? renderItems(items) : renderGuestItems(items),
		icon: `${baseUrl}/static/images/ico/xxhdpi_launcher.png/99cf3909d459.png`,
		logo: feedLogo,
		image: feedLogo,
		allowEmpty: true
	};
}
//#endregion
export { route };
