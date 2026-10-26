import { t as config } from "./config-B5Cf_tHS.mjs";
import "./types-DNj6Etbg.mjs";
import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { t as renderItems } from "./common-utils-fguPekVT.mjs";
import { IgApiClient } from "instagram-private-api";
//#region lib/routes/instagram/private-api/utils.ts
const ig = new IgApiClient();
async function login(ig, cache) {
	if (!config.instagram || !config.instagram.username || !config.instagram.password) throw new ConfigNotFoundError("Instagram RSS is disabled due to the lack of <a href=\"https://docs.rsshub.app/deploy/config#route-specific-configurations\">relevant config</a>");
	const LOGIN_CACHE_KEY = "instagram:login";
	const { username, password } = config.instagram;
	const state = await cache.get(LOGIN_CACHE_KEY);
	if (state) ig.state.deserialize(state);
	else {
		ig.state.generateDevice(username);
		await ig.account.login(username, password);
		queueMicrotask(() => ig.simulate.postLoginFlow());
		logger.debug("Instagram login success.");
	}
	ig.request.end$.subscribe(async () => {
		const loginState = await ig.state.serialize();
		delete loginState.constants;
		await cache.set(LOGIN_CACHE_KEY, loginState, 12e5);
	});
}
//#endregion
//#region lib/routes/instagram/private-api/index.ts
async function loadContent(category, nameOrId) {
	let feedTitle, feedLink, feedDescription, feedLogo;
	let itemsRaw;
	switch (category) {
		case "user": {
			let userInfo, username, id;
			if (Number.isNaN(nameOrId)) {
				username = nameOrId;
				id = await cache_default.tryGet(`instagram:getIdByUsername:${username}`, () => ig.user.getIdByUsername(username), 31536e3);
				userInfo = await cache_default.tryGet(`instagram:userInfo:${id}`, () => ig.user.info(id));
			} else {
				id = nameOrId;
				userInfo = await cache_default.tryGet(`instagram:userInfo:${id}`, () => ig.user.info(id));
				username = userInfo.username;
			}
			feedDescription = userInfo.biography;
			feedLogo = userInfo.profile_pic_url_hd ?? userInfo.hd_profile_pic_url_info?.url ?? userInfo.profile_pic_url;
			feedTitle = `${userInfo.full_name} (@${username}) - Instagram`;
			feedLink = `https://www.instagram.com/${username}`;
			itemsRaw = await cache_default.tryGet(`instagram:feed:${id}`, () => ig.feed.user(id).items(), config.cache.routeExpire, false);
			break;
		}
		case "tags": {
			const tag = nameOrId;
			feedTitle = `#${tag} - Instagram`;
			feedLink = `https://www.instagram.com/explore/tags/${tag}`;
			itemsRaw = await cache_default.tryGet(`instagram:tags:${tag}`, () => ig.feed.tags(tag, "recent").items(), config.cache.routeExpire, false);
			break;
		}
		default: break;
	}
	return {
		feedTitle,
		feedLink,
		feedDescription,
		feedLogo,
		itemsRaw
	};
}
const route = {
	path: "/:category/:key",
	categories: ["social-media"],
	view: 1,
	example: "/instagram/user/stefaniejoosten",
	parameters: {
		category: {
			description: "Feed category",
			default: "user",
			options: [{
				label: "User",
				value: "user"
			}, {
				label: "Tags",
				value: "tags"
			}]
		},
		key: "Username / Hashtag name"
	},
	features: {
		requireConfig: [
			{
				name: "IG_PROXY",
				optional: true,
				description: ""
			},
			{
				name: "IG_USERNAME",
				description: "Instagram username"
			},
			{
				name: "IG_PASSWORD",
				description: "Instagram password, due to [Instagram Private API](https://github.com/dilame/instagram-private-api) restrictions, you have to setup your credentials on the server. 2FA is not supported."
			}
		],
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "User Profile / Hashtag - Private API",
	maintainers: ["oppilate", "DIYgod"],
	handler
};
async function handler(ctx) {
	const availableCategories = ["user", "tags"];
	const { category, key } = ctx.req.param();
	if (!availableCategories.includes(category)) throw new InvalidParameterError("Such feed is not supported.");
	if (config.instagram && config.instagram.proxy) ig.state.proxyUrl = config.instagram.proxy;
	await login(ig, cache_default);
	let data;
	try {
		data = await loadContent(category, key);
	} catch (error) {
		logger.error(`Instagram error: ${error}`);
		throw error;
	}
	return {
		title: data.feedTitle,
		link: data.feedLink,
		description: data.feedDescription,
		item: renderItems(data.itemsRaw),
		icon: "https://www.instagram.com/static/images/ico/xxhdpi_launcher.png/99cf3909d459.png",
		logo: data.feedLogo,
		image: data.feedLogo,
		allowEmpty: true
	};
}
//#endregion
export { route };
