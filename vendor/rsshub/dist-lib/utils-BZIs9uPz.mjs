import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as proxyExport } from "./proxy-Dm18LCRO.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { i as queryToInteger, n as queryToBoolean, t as fallback } from "./readable-social-DP5kGwF5.mjs";
import { n as outPlaywright } from "./playwright-DGfbX7qN.mjs";
import { t as api_default$2 } from "./api-CaldqaWq.mjs";
import x, { Client, ProxyAgent } from "undici";
import { RateLimiterMemory, RateLimiterQueue, RateLimiterRedis } from "rate-limiter-flexible";
import { Cookie, CookieJar } from "tough-cookie";
import queryString from "query-string";
import { CookieAgent, cookie } from "http-cookie-agent/undici";
import { generate } from "otplib";
//#region lib/routes/twitter/api/web-api/gql-id-resolver.ts
const CACHE_KEY = "twitter:gql-query-ids";
const fallbackIds = {
	UserTweets: "E3opETHurmVJflFsUBVuUQ",
	UserByScreenName: "Yka-W8dz7RaEuQNkroPkYw",
	HomeTimeline: "xhYBF94fPSp8ey64FfYXiA",
	HomeLatestTimeline: "0vp2Au9doTKsbn2vIk48Dg",
	UserTweetsAndReplies: "bt4TKuFz4T7Ckk-VvQVSow",
	UserMedia: "dexO_2tohK86JDudXXG3Yw",
	UserByRestId: "Qw77dDjp9xCpUY-AXwt-yQ",
	SearchTimeline: "UN1i3zUiCWa-6r-Uaho4fw",
	ListLatestTweetsTimeline: "Pa45JvqZuKcW1plybfgBlQ",
	TweetDetail: "QuBlQ6SxNAQCt6-kBiCXCQ"
};
const operationNames = Object.keys(fallbackIds);
async function fetchTwitterPage() {
	return await rofetch("https://x.com", { parseResponse: (txt) => txt });
}
function extractQueryIds(scriptContent) {
	const ids = {};
	const matches = scriptContent.matchAll(/queryId:"([^"]+)".+?operationName:"([^"]+)"/g);
	for (const match of matches) {
		const [, queryId, operationName] = match;
		if (operationNames.includes(operationName)) ids[operationName] = queryId;
	}
	return ids;
}
async function fetchAndExtractIds() {
	const mainMatch = (await fetchTwitterPage()).match(/\/client-web\/main\.([a-z0-9]+)\./);
	if (!mainMatch) {
		logger.warn("twitter gql-id-resolver: main.js URL not found in Twitter page");
		return {};
	}
	const mainUrl = `https://abs.twimg.com/responsive-web/client-web/main.${mainMatch[1]}.js`;
	logger.debug(`twitter gql-id-resolver: fetching ${mainUrl}`);
	return extractQueryIds(await rofetch(mainUrl, { parseResponse: (txt) => txt }));
}
let resolvePromise = null;
async function resolveQueryIds() {
	const cached = await cache_default.get(CACHE_KEY);
	if (cached) try {
		const parsed = typeof cached === "string" ? JSON.parse(cached) : cached;
		if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) {
			logger.debug("twitter gql-id-resolver: using cached query IDs");
			return {
				...fallbackIds,
				...parsed
			};
		}
	} catch {}
	if (!resolvePromise) resolvePromise = (async () => {
		try {
			logger.info("twitter gql-id-resolver: fetching fresh query IDs from Twitter JS bundles");
			const ids = await fetchAndExtractIds();
			if (Object.keys(ids).length > 0) {
				await cache_default.set(CACHE_KEY, JSON.stringify(ids), config.cache.contentExpire);
				const found = operationNames.filter((name) => ids[name]);
				const missing = operationNames.filter((name) => !Object.hasOwn(ids, name));
				logger.debug(`twitter gql-id-resolver: resolved ${found.length}/${operationNames.length} query IDs. Missing: ${missing.join(", ") || "none"}`);
			} else logger.warn("twitter gql-id-resolver: failed to extract any query IDs, using fallback");
			return ids;
		} catch (error) {
			logger.warn(`twitter gql-id-resolver: error fetching query IDs: ${error}. Using fallback.`);
			return {};
		} finally {
			resolvePromise = null;
		}
	})();
	const ids = await resolvePromise;
	return {
		...fallbackIds,
		...ids
	};
}
function buildGqlMap(queryIds) {
	const map = {};
	for (const name of operationNames) map[name] = `/graphql/${queryIds[name] || fallbackIds[name]}/${name}`;
	return map;
}
//#endregion
//#region lib/routes/twitter/api/web-api/constants.ts
const baseUrl = "https://x.com/i/api";
let gqlMap = buildGqlMap(fallbackIds);
const initGqlMap = async () => {
	gqlMap = buildGqlMap(await resolveQueryIds());
};
const thirdPartySupportedAPI = [
	"UserByScreenName",
	"UserByRestId",
	"UserTweets",
	"UserTweetsAndReplies",
	"ListLatestTweetsTimeline",
	"SearchTimeline",
	"UserMedia"
];
const gqlFeatureUser = {
	hidden_profile_subscriptions_enabled: true,
	rweb_tipjar_consumption_enabled: true,
	responsive_web_graphql_exclude_directive_enabled: true,
	verified_phone_label_enabled: false,
	subscriptions_verification_info_is_identity_verified_enabled: true,
	subscriptions_verification_info_verified_since_enabled: true,
	highlights_tweets_tab_ui_enabled: true,
	responsive_web_twitter_article_notes_tab_enabled: true,
	subscriptions_feature_can_gift_premium: true,
	creator_subscriptions_tweet_preview_api_enabled: true,
	responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
	responsive_web_graphql_timeline_navigation_enabled: true
};
const gqlFeatureFeed = {
	rweb_tipjar_consumption_enabled: true,
	responsive_web_graphql_exclude_directive_enabled: true,
	verified_phone_label_enabled: false,
	creator_subscriptions_tweet_preview_api_enabled: true,
	responsive_web_graphql_timeline_navigation_enabled: true,
	responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
	communities_web_enable_tweet_community_results_fetch: true,
	c9s_tweet_anatomy_moderator_badge_enabled: true,
	articles_preview_enabled: true,
	responsive_web_edit_tweet_api_enabled: true,
	graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
	view_counts_everywhere_api_enabled: true,
	longform_notetweets_consumption_enabled: true,
	responsive_web_twitter_article_tweet_consumption_enabled: true,
	tweet_awards_web_tipping_enabled: false,
	creator_subscriptions_quote_tweet_preview_enabled: false,
	freedom_of_speech_not_reach_fetch_enabled: true,
	standardized_nudges_misinfo: true,
	tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true,
	rweb_video_timestamps_enabled: true,
	longform_notetweets_rich_text_read_enabled: true,
	longform_notetweets_inline_media_enabled: true,
	responsive_web_enhance_cards_enabled: false
};
const TweetDetailFeatures = {
	rweb_tipjar_consumption_enabled: true,
	responsive_web_graphql_exclude_directive_enabled: true,
	verified_phone_label_enabled: false,
	creator_subscriptions_tweet_preview_api_enabled: true,
	responsive_web_graphql_timeline_navigation_enabled: true,
	responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
	communities_web_enable_tweet_community_results_fetch: true,
	c9s_tweet_anatomy_moderator_badge_enabled: true,
	articles_preview_enabled: true,
	responsive_web_edit_tweet_api_enabled: true,
	graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
	view_counts_everywhere_api_enabled: true,
	longform_notetweets_consumption_enabled: true,
	responsive_web_twitter_article_tweet_consumption_enabled: true,
	tweet_awards_web_tipping_enabled: false,
	creator_subscriptions_quote_tweet_preview_enabled: false,
	freedom_of_speech_not_reach_fetch_enabled: true,
	standardized_nudges_misinfo: true,
	tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true,
	rweb_video_timestamps_enabled: true,
	longform_notetweets_rich_text_read_enabled: true,
	longform_notetweets_inline_media_enabled: true,
	responsive_web_enhance_cards_enabled: false
};
const gqlFeatures = {
	UserByScreenName: gqlFeatureUser,
	UserByRestId: gqlFeatureUser,
	UserTweets: gqlFeatureFeed,
	UserTweetsAndReplies: gqlFeatureFeed,
	UserMedia: gqlFeatureFeed,
	SearchTimeline: gqlFeatureFeed,
	ListLatestTweetsTimeline: gqlFeatureFeed,
	HomeTimeline: gqlFeatureFeed,
	HomeLatestTimeline: TweetDetailFeatures,
	TweetDetail: TweetDetailFeatures,
	Likes: gqlFeatureFeed
};
const bearerToken = "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA";
//#endregion
//#region lib/routes/twitter/api/web-api/login.ts
const loginLimiterQueue = new RateLimiterQueue(cache_default.clients.redisClient ? new RateLimiterRedis({
	points: 1,
	duration: 20,
	execEvenly: true,
	storeClient: cache_default.clients.redisClient
}) : new RateLimiterMemory({
	points: 1,
	duration: 20,
	execEvenly: true
}));
async function login({ username, password, authenticationSecret }) {
	if (!username || !password) return;
	try {
		await loginLimiterQueue.removeTokens(1);
		const cookieJar = new CookieJar();
		const context = await outPlaywright();
		const page = await context.newPage();
		await page.goto("https://x.com/i/flow/login");
		await page.waitForSelector("input[autocomplete=\"username\"]");
		await page.type("input[autocomplete=\"username\"]", username);
		await (await page.$$("button"))[3]?.click();
		await page.waitForSelector("input[autocomplete=\"current-password\"]");
		await page.type("input[autocomplete=\"current-password\"]", password);
		(await page.waitForSelector("button[data-testid=\"LoginForm_Login_Button\"]"))?.click();
		if (authenticationSecret) {
			await page.waitForSelector("input[inputmode=\"numeric\"]");
			const token = await generate({ secret: authenticationSecret });
			await page.type("input[inputmode=\"numeric\"]", token);
			(await page.waitForSelector("button[data-testid=\"ocfEnterTextNextButton\"]"))?.click();
		}
		const cookieString = await new Promise((resolve) => {
			page.on("response", async (response) => {
				if (!response.url().includes("/HomeTimeline")) return;
				if ((await response.json())?.data?.home?.home_timeline_urt?.instructions?.[0]?.entries?.[0]?.entryId === "messageprompt-suspended-prompt") {
					logger.error(`twitter debug: twitter username ${username} login failed: messageprompt-suspended-prompt`);
					resolve("");
				}
				const cookies = await page.context().cookies();
				for (const cookie of cookies) cookieJar.setCookieSync(`${cookie.name}=${cookie.value}`, "https://x.com");
				logger.debug(`twitter debug: twitter username ${username} login success`);
				resolve(JSON.stringify(cookieJar.serializeSync()));
			});
		});
		await context.close();
		return cookieString;
	} catch (error) {
		logger.error(`twitter debug: twitter username ${username} login failed:`, error);
	}
}
//#endregion
//#region lib/routes/twitter/api/web-api/utils.ts
let authTokenIndex = 0;
const token2Cookie = async (token) => {
	const c = await cache_default.get(`twitter:cookie:${token}`);
	if (c) return c;
	const jar = new CookieJar();
	await jar.setCookie(`auth_token=${token}`, "https://x.com");
	try {
		const agent = proxyExport.proxyUri ? new ProxyAgent({
			factory: (origin, opts) => new Client(origin, opts).compose(cookie({ jar })),
			uri: proxyExport.proxyUri
		}) : new CookieAgent({ cookies: { jar } });
		if (token) await rofetch("https://x.com", { dispatcher: agent });
		else {
			const gt = (await rofetch("https://x.com/narendramodi?mx=2", { dispatcher: agent })).match(/document\.cookie="gt=(\d+)/)?.[1];
			if (gt) jar.setCookieSync(`gt=${gt}`, "https://x.com");
		}
		const cookie$1 = JSON.stringify(jar.serializeSync());
		cache_default.set(`twitter:cookie:${token}`, cookie$1);
		return cookie$1;
	} catch {
		return "";
	}
};
const lockPrefix = "twitter:lock-token1:";
const getAuth = async (retry) => {
	if (!config.twitter.authToken || retry <= 0) return;
	const index = authTokenIndex++ % config.twitter.authToken.length;
	const token = config.twitter.authToken[index];
	if (await cache_default.get(`${lockPrefix}${token}`, false)) {
		logger.debug(`twitter debug: twitter cookie for token ${token} is locked, retry: ${retry}`);
		await new Promise((resolve) => setTimeout(resolve, Math.random() * 500 + 500));
		return await getAuth(retry - 1);
	}
	logger.debug(`twitter debug: lock twitter cookie for token ${token}`);
	await cache_default.set(`${lockPrefix}${token}`, "1", 20);
	return {
		token,
		username: config.twitter.username?.[index],
		password: config.twitter.password?.[index],
		authenticationSecret: config.twitter.authenticationSecret?.[index]
	};
};
const twitterGot = async (url, params, options) => {
	const auth = await getAuth(30);
	if (!auth && !options?.allowNoAuth) throw new ConfigNotFoundError("No valid Twitter token found");
	const requestUrl = `${url}?${queryString.stringify(params)}`;
	let cookie$2 = await token2Cookie(auth?.token);
	if (!cookie$2 && auth) cookie$2 = await login({
		username: auth.username,
		password: auth.password,
		authenticationSecret: auth.authenticationSecret
	});
	let dispatchers;
	if (cookie$2) {
		logger.debug(`twitter debug: got twitter cookie for token ${auth?.token}`);
		if (typeof cookie$2 === "string") cookie$2 = JSON.parse(cookie$2);
		const jar = CookieJar.deserializeSync(cookie$2);
		const agent = proxyExport.proxyUri ? new ProxyAgent({
			factory: (origin, opts) => new Client(origin, opts).compose(cookie({ jar })),
			uri: proxyExport.proxyUri
		}) : new CookieAgent({ cookies: { jar } });
		if (proxyExport.proxyUri) logger.debug(`twitter debug: Proxying request: ${requestUrl}`);
		dispatchers = {
			jar,
			agent
		};
	} else if (auth) throw new ConfigNotFoundError(`Twitter cookie for token ${auth?.token?.replace(/(\w{8})(\w+)/, (_, v1, v2) => v1 + "*".repeat(v2.length))} is not valid`);
	const jsonCookie = dispatchers ? Object.fromEntries(dispatchers.jar.getCookieStringSync(url).split(";").map((c) => Cookie.parse(c)?.toJSON()).map((c) => [c?.key, c?.value])) : {};
	const response = await x.fetch(requestUrl, {
		headers: {
			authority: "x.com",
			accept: "*/*",
			"accept-language": "en-US,en;q=0.9",
			authorization: bearerToken,
			"cache-control": "no-cache",
			"content-type": "application/json",
			dnt: "1",
			pragma: "no-cache",
			referer: "https://x.com/",
			"x-twitter-active-user": "yes",
			"x-twitter-client-language": "en",
			"x-csrf-token": jsonCookie.ct0,
			...auth?.token ? { "x-twitter-auth-type": "OAuth2Session" } : { "x-guest-token": jsonCookie.gt }
		},
		dispatcher: dispatchers?.agent
	});
	let responseData;
	try {
		responseData = await response.json();
	} catch {
		responseData = null;
	}
	const remaining = response.headers.get("x-rate-limit-remaining");
	const remainingInt = Number.parseInt(remaining || "0");
	const reset = response.headers.get("x-rate-limit-reset");
	logger.debug(`twitter debug: twitter rate limit remaining for token ${auth?.token} is ${remaining} and reset at ${reset}, auth: ${JSON.stringify(auth)}, status: ${response.status}, data: ${JSON.stringify(responseData?.data)}, cookie: ${JSON.stringify(dispatchers?.jar.serializeSync())}`);
	if (auth) if (remaining && remainingInt < 2 && reset) {
		const delay = ((/* @__PURE__ */ new Date(Number.parseInt(reset) * 1e3)).getTime() - Date.now()) / 1e3;
		logger.debug(`twitter debug: twitter rate limit exceeded for token ${auth.token} with status ${response.status}, will unlock after ${delay}s`);
		await cache_default.set(`${lockPrefix}${auth.token}`, "1", Math.ceil(delay) * 2);
	} else if (response.status === 429 || JSON.stringify(responseData?.data) === "{\"user\":{}}") {
		logger.debug(`twitter debug: twitter rate limit exceeded for token ${auth.token} with status ${response.status}`);
		await cache_default.set(`${lockPrefix}${auth.token}`, "1", 2e3);
	} else if (response.status === 403 || response.status === 401) {
		const newCookie = await login({
			username: auth.username,
			password: auth.password,
			authenticationSecret: auth.authenticationSecret
		});
		if (newCookie) {
			logger.debug(`twitter debug: reset twitter cookie for token ${auth.token}, ${newCookie}`);
			await cache_default.set(`twitter:cookie:${auth.token}`, newCookie, config.cache.contentExpire);
			await cache_default.set(`${lockPrefix}${auth.token}`, "", 1);
		} else {
			const tokenIndex = config.twitter.authToken?.indexOf(auth.token);
			if (tokenIndex !== void 0 && tokenIndex !== -1) config.twitter.authToken?.splice(tokenIndex, 1);
			if (auth.username) {
				const usernameIndex = config.twitter.username?.indexOf(auth.username);
				if (usernameIndex !== void 0 && usernameIndex !== -1) config.twitter.username?.splice(usernameIndex, 1);
			}
			if (auth.password) {
				const passwordIndex = config.twitter.password?.indexOf(auth.password);
				if (passwordIndex !== void 0 && passwordIndex !== -1) config.twitter.password?.splice(passwordIndex, 1);
			}
			logger.debug(`twitter debug: delete twitter cookie for token ${auth.token} with status ${response.status}, remaining tokens: ${config.twitter.authToken?.length}`);
			await cache_default.set(`${lockPrefix}${auth.token}`, "1", 3600);
		}
	} else {
		logger.debug(`twitter debug: unlock twitter cookie with success for token ${auth.token}`);
		await cache_default.set(`${lockPrefix}${auth.token}`, "", 1);
	}
	if (response.status >= 400) throw new Error(`Twitter API error: ${response.status}`);
	if (auth?.token) {
		logger.debug(`twitter debug: update twitter cookie for token ${auth.token}`);
		await cache_default.set(`twitter:cookie:${auth.token}`, JSON.stringify(dispatchers?.jar.serializeSync()), config.cache.contentExpire);
	}
	return responseData;
};
const paginationTweets = async (endpoint, userId, variables, path) => {
	const params = {
		variables: JSON.stringify({
			...variables,
			userId
		}),
		features: JSON.stringify(gqlFeatures[endpoint])
	};
	const fetchData = async () => {
		if (config.twitter.thirdPartyApi && thirdPartySupportedAPI.includes(endpoint)) {
			const { data } = await rofetch(`${config.twitter.thirdPartyApi}${gqlMap[endpoint]}`, {
				method: "GET",
				params,
				headers: { "accept-encoding": "gzip" }
			});
			return data;
		}
		const { data } = await twitterGot(baseUrl + gqlMap[endpoint], params);
		return data;
	};
	const getInstructions = (data) => {
		if (path) {
			let instructions = data;
			for (const p of path) instructions = instructions[p];
			return instructions.instructions;
		}
		const userResult = data?.user?.result;
		const instructions = (userResult?.timeline?.timeline || userResult?.timeline?.timeline_v2 || userResult?.timeline_v2?.timeline)?.instructions;
		if (!instructions) logger.debug(`twitter debug: instructions not found in data: ${JSON.stringify(data)}`);
		return instructions;
	};
	const instructions = getInstructions(await fetchData());
	if (!instructions) return [];
	const moduleItems = instructions.find((i) => i.type === "TimelineAddToModule")?.moduleItems;
	const entries = instructions.find((i) => i.type === "TimelineAddEntries")?.entries;
	return entries.find((i) => i.entryId === "profile-grid-0")?.content?.items || moduleItems || entries || [];
};
const getLegacyUser = (tweet) => tweet.core?.user_result?.result?.legacy || tweet.core?.user_results?.result?.legacy;
const getCoreUser = (tweet) => tweet.core?.user_result?.result?.core || tweet.core?.user_results?.result?.core;
const hydrateLegacyUser = (legacy, tweet) => {
	legacy.user = getLegacyUser(tweet);
	const coreUser = getCoreUser(tweet);
	if (!legacy.user || !coreUser) return;
	if (coreUser.name) legacy.user.name = coreUser.name;
	if (coreUser.screen_name) legacy.user.screen_name = coreUser.screen_name;
};
function gatherLegacyFromData(entries, filterNested, userId) {
	const tweets = [];
	const filteredEntries = [];
	for (const entry of entries) {
		const entryId = entry.entryId;
		if (entryId) {
			if (entryId.startsWith("tweet-") || entryId.startsWith("profile-grid-0-tweet-")) filteredEntries.push(entry);
			if (filterNested && filterNested.some((f) => entryId.startsWith(f))) filteredEntries.push(...entry.content.items);
		}
	}
	for (const entry of filteredEntries) {
		if (!entry.entryId) continue;
		const content = entry.content || entry.item;
		let tweet = content?.content?.tweetResult?.result || content?.itemContent?.tweet_results?.result;
		if (tweet?.__typename === "TweetPreviewDisplay") {
			const preview = tweet.tweet;
			if (preview?.rest_id) {
				const userResult = preview.core?.user_results?.result;
				const fakeLegacy = {
					id_str: preview.rest_id,
					full_text: `[Subscribers Only] ${preview.text ?? ""}`,
					created_at: preview.created_at ?? "",
					entities: {
						urls: [],
						hashtags: [],
						symbols: [],
						user_mentions: []
					},
					user_id_str: userResult?.rest_id ?? "",
					favorite_count: preview.favorite_count ?? 0,
					reply_count: preview.reply_count ?? 0,
					retweet_count: preview.retweet_count ?? 0
				};
				hydrateLegacyUser(fakeLegacy, {
					core: preview.core,
					rest_id: preview.rest_id
				});
				if (userId === void 0 || fakeLegacy.user_id_str === userId + "") tweets.push(fakeLegacy);
			}
			continue;
		}
		if (tweet && tweet.tweet) tweet = tweet.tweet;
		if (tweet) {
			const retweet = tweet.legacy?.retweeted_status_result?.result;
			for (const t of [tweet, retweet]) {
				if (!t?.legacy) continue;
				hydrateLegacyUser(t.legacy, t);
				t.legacy.id_str = t.rest_id;
				const quote = t.quoted_status_result?.result?.tweet || t.quoted_status_result?.result;
				if (quote?.legacy) {
					t.legacy.quoted_status = quote.legacy;
					hydrateLegacyUser(t.legacy.quoted_status, quote);
				}
				if (t.note_tweet) {
					const tmp = t.note_tweet.note_tweet_results.result;
					t.legacy.entities.hashtags = tmp.entity_set.hashtags;
					t.legacy.entities.symbols = tmp.entity_set.symbols;
					t.legacy.entities.urls = tmp.entity_set.urls;
					t.legacy.entities.user_mentions = tmp.entity_set.user_mentions;
					t.legacy.full_text = tmp.text;
				}
			}
			const legacy = tweet.legacy;
			if (legacy) {
				if (retweet) legacy.retweeted_status = retweet.legacy;
				if (userId === void 0 || legacy.user_id_str === userId + "") tweets.push(legacy);
			}
		}
	}
	return tweets;
}
//#endregion
//#region lib/routes/twitter/api/web-api/api.ts
const getUserData = (id) => cache_default.tryGet(`twitter-userdata-${id}`, () => {
	const params = {
		variables: id.startsWith("+") ? JSON.stringify({
			userId: id.slice(1),
			withSafetyModeUserFields: true
		}) : JSON.stringify({
			screen_name: id,
			withSafetyModeUserFields: true
		}),
		features: JSON.stringify(id.startsWith("+") ? gqlFeatures.UserByRestId : gqlFeatures.UserByScreenName),
		fieldToggles: JSON.stringify({ withAuxiliaryUserLabels: false })
	};
	if (config.twitter.thirdPartyApi) {
		const endpoint = id.startsWith("+") ? gqlMap.UserByRestId : gqlMap.UserByScreenName;
		return rofetch(`${config.twitter.thirdPartyApi}${endpoint}`, {
			method: "GET",
			params,
			headers: { "accept-encoding": "gzip" }
		});
	}
	return twitterGot(`${baseUrl}${id.startsWith("+") ? gqlMap.UserByRestId : gqlMap.UserByScreenName}`, params, { allowNoAuth: !id.startsWith("+") });
});
const cacheTryGet = async (_id, params, func) => {
	const userData = await getUserData(_id);
	const id = (userData.data?.user || userData.data?.user_result)?.result?.rest_id;
	if (id === void 0) {
		cache_default.set(`twitter-userdata-${_id}`, "", config.cache.contentExpire);
		throw new InvalidParameterError("User not found");
	}
	const funcName = func.name;
	const paramsString = JSON.stringify(params);
	return cache_default.tryGet(`twitter:${id}:${funcName}:${paramsString}`, () => func(id, params), config.cache.routeExpire, false);
};
const getUserTweets = (id, params) => cacheTryGet(id, params, async (id, params = {}) => gatherLegacyFromData(await paginationTweets("UserTweets", id, {
	...params,
	count: 20,
	includePromotedContent: true,
	withQuickPromoteEligibilityTweetFields: true,
	withVoice: true,
	withV2Timeline: true
})));
const getUserTweetsAndReplies = (id, params) => cacheTryGet(id, params, async (id, params = {}) => gatherLegacyFromData(await paginationTweets("UserTweetsAndReplies", id, {
	...params,
	count: 20,
	includePromotedContent: true,
	withCommunity: true,
	withVoice: true,
	withV2Timeline: true
}), ["profile-conversation-"], id));
const getUserMedia = (id, params) => cacheTryGet(id, params, async (id, params = {}) => gatherLegacyFromData(await paginationTweets("UserMedia", id, {
	...params,
	count: 20,
	includePromotedContent: false,
	withClientEventToken: false,
	withBirdwatchNotes: false,
	withVoice: true,
	withV2Timeline: true
})));
const getUserLikes = (id, params) => cacheTryGet(id, params, async (id, params = {}) => gatherLegacyFromData(await paginationTweets("Likes", id, {
	...params,
	includeHasBirdwatchNotes: false,
	includePromotedContent: false,
	withBirdwatchNotes: false,
	withVoice: false,
	withV2Timeline: true
})));
const getUserTweet = (id, params) => cacheTryGet(id, params, async (id, params = {}) => gatherLegacyFromData(await paginationTweets("TweetDetail", id, {
	...params,
	includeHasBirdwatchNotes: false,
	includePromotedContent: false,
	withBirdwatchNotes: false,
	withVoice: false,
	withV2Timeline: true
}, ["threaded_conversation_with_injections_v2"]), ["homeConversation-", "conversationthread-"]));
const getSearch = async (keywords, params) => gatherLegacyFromData(await paginationTweets("SearchTimeline", void 0, {
	...params,
	rawQuery: keywords,
	count: 20,
	querySource: "typed_query",
	product: "Latest"
}, [
	"search_by_raw_query",
	"search_timeline",
	"timeline"
]));
const getList = async (id, params) => gatherLegacyFromData(await paginationTweets("ListLatestTweetsTimeline", void 0, {
	...params,
	listId: id,
	count: 20
}, [
	"list",
	"tweets_timeline",
	"timeline"
]));
const getUser = async (id) => {
	const userData = await getUserData(id);
	if (!userData.data.user) throw new InvalidParameterError("This account doesn't exist");
	if (userData.data.user.result.__typename === "UserUnavailable") throw new InvalidParameterError(userData.data.user.result.message || "User is unavailable");
	return {
		profile_image_url: userData.data?.user?.result?.avatar?.image_url,
		...userData.data?.user?.result?.core,
		...(userData.data?.user || userData.data?.user_result)?.result?.legacy
	};
};
const getHomeTimeline = async (id, params) => gatherLegacyFromData(await paginationTweets("HomeTimeline", void 0, {
	...params,
	count: 20,
	includePromotedContent: true,
	latestControlAvailable: true,
	requestContext: "launch",
	withCommunity: true
}, ["home", "home_timeline_urt"]));
const getHomeLatestTimeline = async (id, params) => gatherLegacyFromData(await paginationTweets("HomeLatestTimeline", void 0, {
	...params,
	count: 20,
	includePromotedContent: true,
	latestControlAvailable: true,
	requestContext: "launch",
	withCommunity: true
}, ["home", "home_timeline_urt"]));
var api_default$1 = {
	getUser,
	getUserTweets,
	getUserTweetsAndReplies,
	getUserMedia,
	getUserLikes,
	getUserTweet,
	getSearch,
	getList,
	getHomeTimeline,
	getHomeLatestTimeline,
	init: initGqlMap
};
//#endregion
//#region lib/routes/twitter/api/index.ts
const enableThirdPartyApi = config.twitter.thirdPartyApi;
const enableWebApi = config.twitter.authToken;
const enableDeveloperApi = config.twitter.consumerKey && config.twitter.consumerSecret;
let api = {
	init: () => {
		throw new ConfigNotFoundError("Twitter API is not configured");
	},
	getUser: () => null,
	getUserTweets: () => null,
	getUserTweetsAndReplies: () => null,
	getUserMedia: () => null,
	getUserLikes: () => null,
	getUserTweet: () => null,
	getSearch: () => null,
	getList: () => null,
	getHomeTimeline: () => null,
	getHomeLatestTimeline: () => null
};
if (enableThirdPartyApi || enableWebApi) api = api_default$1;
else if (enableDeveloperApi) api = api_default$2;
var api_default = api;
//#endregion
//#region lib/routes/twitter/utils.ts
const getQueryParams = (url) => Object.fromEntries(new URL(url).searchParams.entries());
const getOriginalImg = (url) => {
	let m;
	if (m = url.match(/^(https?:\/\/\w+\.twimg\.com\/media\/[^/:]+)\.(jpg|jpeg|gif|png|bmp|webp)(:\w+)?$/i)) {
		let format = m[2];
		if (m[2] === "jpeg") format = "jpg";
		return `${m[1]}?format=${format}&name=orig`;
	}
	if (m = url.match(/^(https?:\/\/\w+\.twimg\.com\/[^?]+)(\?.+)$/i)) {
		const pars = getQueryParams(url);
		if (!pars.format || !pars.name) return url;
		if (pars.name === "orig") return url;
		return m[1] + "?format=" + pars.format + "&name=orig";
	}
	return url;
};
const replaceBreak = (text) => text.replaceAll(/<br><br>|<br>/g, " ");
const quoteSeparator = "<hr style='border:0;border-top:1px solid #80808030;margin:12px 0;'>";
const formatText = (item) => {
	let text = item.full_text;
	const id_str = item.id_str || item.conversation_id_str;
	const urls = item.entities.urls || [];
	for (const url of urls) text = text.replaceAll(url.url, () => url.expanded_url?.endsWith(id_str) ? "" : url.expanded_url);
	const media = item.extended_entities?.media || [];
	for (const m of media) text = text.replaceAll(m.url, "");
	return text.trim().replaceAll("\n", "<br>");
};
const ProcessFeed = (ctx, { data = [] }, params = {}) => {
	const routeParams = new URLSearchParams(ctx.req.param("routeParams"));
	params = {
		readable: fallback(params.readable, queryToBoolean(routeParams.get("readable")), false),
		authorNameBold: fallback(params.authorNameBold, queryToBoolean(routeParams.get("authorNameBold")), false),
		showAuthorInTitle: fallback(params.showAuthorInTitle, queryToBoolean(routeParams.get("showAuthorInTitle")), false),
		showAuthorAsTitleOnly: fallback(params.showAuthorAsTitleOnly, queryToBoolean(routeParams.get("showAuthorAsTitleOnly")), false),
		showAuthorInDesc: fallback(params.showAuthorInDesc, queryToBoolean(routeParams.get("showAuthorInDesc")), false),
		showQuotedAuthorAvatarInDesc: fallback(params.showQuotedAuthorAvatarInDesc, queryToBoolean(routeParams.get("showQuotedAuthorAvatarInDesc")), false),
		showAuthorAvatarInDesc: fallback(params.showAuthorAvatarInDesc, queryToBoolean(routeParams.get("showAuthorAvatarInDesc")), false),
		showEmojiForRetweetAndReply: fallback(params.showEmojiForRetweetAndReply, queryToBoolean(routeParams.get("showEmojiForRetweetAndReply")), false),
		showSymbolForRetweetAndReply: fallback(params.showSymbolForRetweetAndReply, queryToBoolean(routeParams.get("showSymbolForRetweetAndReply")), true),
		showRetweetTextInTitle: fallback(params.showRetweetTextInTitle, queryToBoolean(routeParams.get("showRetweetTextInTitle")), true),
		addLinkForPics: fallback(params.addLinkForPics, queryToBoolean(routeParams.get("addLinkForPics")), false),
		showTimestampInDescription: fallback(params.showTimestampInDescription, queryToBoolean(routeParams.get("showTimestampInDescription")), false),
		showQuotedInTitle: fallback(params.showQuotedInTitle, queryToBoolean(routeParams.get("showQuotedInTitle")), false),
		widthOfPics: fallback(params.widthOfPics, queryToInteger(routeParams.get("widthOfPics")), -1),
		heightOfPics: fallback(params.heightOfPics, queryToInteger(routeParams.get("heightOfPics")), -1),
		sizeOfAuthorAvatar: fallback(params.sizeOfAuthorAvatar, queryToInteger(routeParams.get("sizeOfAuthorAvatar")), 48),
		sizeOfQuotedAuthorAvatar: fallback(params.sizeOfQuotedAuthorAvatar, queryToInteger(routeParams.get("sizeOfQuotedAuthorAvatar")), 24),
		mediaNumber: fallback(params.mediaNumber, queryToInteger(routeParams.get("mediaNumber")), false),
		showEmojiForSubscriberOnly: fallback(params.showEmojiForSubscriberOnly, queryToBoolean(routeParams.get("showEmojiForSubscriberOnly")), false),
		showSymbolForSubscriberOnly: fallback(params.showSymbolForSubscriberOnly, queryToBoolean(routeParams.get("showSymbolForSubscriberOnly")), true),
		showFullPrefixForSubscriberOnly: fallback(params.showFullPrefixForSubscriberOnly, queryToBoolean(routeParams.get("showFullPrefixForSubscriberOnly")), false)
	};
	const { readable, authorNameBold, showAuthorInTitle, showAuthorAsTitleOnly, showAuthorInDesc, showQuotedAuthorAvatarInDesc, showAuthorAvatarInDesc, showEmojiForRetweetAndReply, showSymbolForRetweetAndReply, showRetweetTextInTitle, addLinkForPics, showTimestampInDescription, showQuotedInTitle, mediaNumber, showEmojiForSubscriberOnly, showSymbolForSubscriberOnly, showFullPrefixForSubscriberOnly, widthOfPics, heightOfPics, sizeOfAuthorAvatar, sizeOfQuotedAuthorAvatar } = params;
	const formatVideo = (media, extraAttrs = "") => {
		let content = "";
		let bestVideo = null;
		for (const item of media.video_info.variants) if (!bestVideo || (item.bitrate || 0) > (bestVideo.bitrate || -Infinity)) bestVideo = item;
		if (bestVideo && bestVideo.url) {
			const gifAutoPlayAttr = media.type === "animated_gif" ? "autoplay loop muted webkit-playsinline playsinline" : "";
			if (!readable) content += "<br>";
			content += `<video width="${media.sizes.large.w}" height="${media.sizes.large.h}" src='${bestVideo.url}' ${gifAutoPlayAttr} controls='controls' poster='${getOriginalImg(media.media_url_https)}' ${extraAttrs}></video>`;
		}
		return content;
	};
	const formatMedia = (item) => {
		let img = "";
		if (item.extended_entities) {
			const mediaCount = item.extended_entities.media.length;
			let index = 1;
			for (const media of item.extended_entities.media) {
				let content = "";
				let style = "";
				let originalImg;
				switch (media.type) {
					case "animated_gif":
					case "video":
						content = formatVideo(media);
						break;
					default:
						originalImg = getOriginalImg(media.media_url_https);
						if (!readable) content += "<br>";
						if (addLinkForPics) content += `<a href='${originalImg}' target='_blank' rel='noopener noreferrer'>`;
						content += "<img ";
						if (widthOfPics >= 0) {
							content += ` width="${widthOfPics}"`;
							style += `width: ${widthOfPics}px;`;
						}
						if (heightOfPics > 0) {
							content += `height="${heightOfPics}" `;
							style += `height: ${heightOfPics}px;`;
						}
						if (widthOfPics <= 0 && heightOfPics <= 0) content += `width="${media.sizes.large.w}" height="${media.sizes.large.h}" `;
						content += ` style="${style}" ${readable ? "hspace=\"4\" vspace=\"8\"" : ""} src="${originalImg}">`;
						if (addLinkForPics) content += "</a>";
						break;
				}
				img += content;
				if (mediaNumber) {
					img += `<p style="text-align:center">${index}/${mediaCount}</p>`;
					index++;
				}
			}
		}
		if (readable && img) img = `<br clear='both' /><div style='clear: both'></div>` + img;
		return img;
	};
	const generatePicsPrefix = (item) => {
		let picsPrefix = "";
		if (item.extended_entities) for (const media of item.extended_entities.media) {
			let content;
			let originalImg;
			switch (media.type) {
				case "video":
					content = formatVideo(media, "width=\"0\" height=\"0\"");
					break;
				default:
					originalImg = getOriginalImg(media.media_url_https);
					content = `<img width='0' height='0' hidden='true' src='${originalImg}'>`;
					break;
			}
			picsPrefix += content;
		}
		return picsPrefix;
	};
	return data.map((item) => {
		if (item.full_text?.startsWith("[Subscribers Only]")) {
			const text = item.full_text.replace("[Subscribers Only] ", "");
			item.full_text = `${showFullPrefixForSubscriberOnly ? "🔒 [Subscribers Only] " : showEmojiForSubscriberOnly ? "🔒 " : showSymbolForSubscriberOnly ? "[Subscribers Only] " : ""}${text}`;
		}
		const originalItem = item;
		item = item.retweeted_status || item;
		item.full_text ||= item.text;
		item.full_text = formatText(item);
		const img = formatMedia(item);
		let picsPrefix = generatePicsPrefix(item);
		let quote = "";
		let quoteInTitle = "";
		if (item.is_quote_status) {
			const quoteData = item.quoted_status;
			if (quoteData?.user) {
				quoteData.full_text ||= quoteData.text;
				const author = quoteData.user;
				if (!readable) quote += quoteSeparator;
				quote += "<div class=\"rsshub-quote\">";
				if (readable) {
					quote += `<br clear='both' /><div style='clear: both'></div>`;
					quote += `<blockquote style='background: #80808010;border-top:1px solid #80808030;border-bottom:1px solid #80808030;margin:0;padding:5px 20px;'>`;
				}
				if (readable) quote += `<a href='https://x.com/${author.screen_name}' target='_blank' rel='noopener noreferrer'>`;
				if (showQuotedAuthorAvatarInDesc) quote += `<img width='${sizeOfQuotedAuthorAvatar}' height='${sizeOfQuotedAuthorAvatar}' src='${author.profile_image_url_https}' ${readable ? "hspace=\"8\" vspace=\"8\" align=\"left\"" : ""}>`;
				if (authorNameBold) quote += "<strong>";
				quote += author.name;
				if (authorNameBold) quote += "</strong>";
				if (readable) quote += "</a>";
				quote += ":&ensp;";
				quote += formatText(quoteData);
				if (!readable) quote += "<br>";
				quote += formatMedia(quoteData);
				picsPrefix += generatePicsPrefix(quoteData);
				quoteInTitle += showEmojiForRetweetAndReply ? " 💬 " : showSymbolForRetweetAndReply ? " RT " : "";
				quoteInTitle += `${author.name}: ${formatText(quoteData)}`;
				if (readable) quote += `<br><small>Link: <a href='https://x.com/${author.screen_name}/status/${quoteData.id_str || quoteData.conversation_id_str}' target='_blank' rel='noopener noreferrer'>https://x.com/${author.screen_name}/status/${quoteData.id_str || quoteData.conversation_id_str}</a></small>`;
				if (showTimestampInDescription) {
					quote += "<br><small>" + parseDate(quoteData.created_at);
					quote += "</small>";
					if (readable) quote += `<br clear='both' /><div style='clear: both'></div>`;
				}
				if (readable) quote += "</blockquote>";
				quote += "</div>";
			}
		}
		let title = "";
		if (showAuthorInTitle) title += originalItem.user?.name + ": ";
		const isRetweet = originalItem !== item;
		const isQuote = item.is_quote_status;
		if (!isRetweet && (!isQuote || showRetweetTextInTitle)) {
			if (item.in_reply_to_screen_name) title += showEmojiForRetweetAndReply ? "↩️ " : showSymbolForRetweetAndReply ? "Re " : "";
			title += replaceBreak(originalItem.full_text);
		}
		if (isRetweet) {
			title += showEmojiForRetweetAndReply ? "🔁 " : showSymbolForRetweetAndReply ? "RT " : "";
			title += item.user.name + ": ";
			if (item.in_reply_to_screen_name) title += showEmojiForRetweetAndReply ? " ↩️ " : showSymbolForRetweetAndReply ? " Re " : "";
			title += replaceBreak(item.full_text);
		}
		if (showQuotedInTitle) title += quoteInTitle;
		if (showAuthorAsTitleOnly) title = originalItem.user?.name;
		let description = "";
		if (showAuthorInDesc && showAuthorAvatarInDesc) description += picsPrefix;
		if (isRetweet) {
			if (showAuthorInDesc) {
				if (readable) {
					description += "<small>";
					description += `<a href='https://x.com/${originalItem.user?.screen_name}' target='_blank' rel='noopener noreferrer'>`;
				}
				if (authorNameBold) description += "<strong>";
				description += originalItem.user?.name;
				if (authorNameBold) description += "</strong>";
				if (readable) description += "</a>";
				description += "&ensp;";
			}
			description += showEmojiForRetweetAndReply ? "🔁" : showSymbolForRetweetAndReply ? "RT" : "";
			if (!showAuthorInDesc) {
				description += "&ensp;";
				if (readable) description += `<a href='https://x.com/${item.user?.screen_name}' target='_blank' rel='noopener noreferrer'>`;
				if (authorNameBold) description += "<strong>";
				description += item.user?.name;
				if (authorNameBold) description += "</strong>";
				if (readable) description += "</a>";
			}
			if (readable) description += "</small>";
			description += "<br>";
		}
		if (showAuthorInDesc) {
			if (readable) description += `<a href='https://x.com/${item.user?.screen_name}' target='_blank' rel='noopener noreferrer'>`;
			if (showAuthorAvatarInDesc) description += `<img width='${sizeOfAuthorAvatar}' height='${sizeOfAuthorAvatar}' src='${item.user.profile_image_url_https}' ${readable ? "hspace=\"8\" vspace=\"8\" align=\"left\"" : ""}>`;
			if (authorNameBold) description += "<strong>";
			description += item.user?.name;
			if (authorNameBold) description += "</strong>";
			if (readable) description += "</a>";
			description += ":&ensp;";
		}
		if (item.in_reply_to_screen_name) description += showEmojiForRetweetAndReply ? "↩️ " : showSymbolForRetweetAndReply ? "Re " : "";
		description += item.full_text;
		const category = description.match(/(\s)?(#[^\s;<]+)/g)?.map((e) => e?.match(/#([^\s<]+)/)?.[1]);
		description += img;
		description += quote;
		if (readable) description += `<br clear='both' /><div style='clear: both'></div>`;
		if (showTimestampInDescription) {
			if (readable) description += "<hr>";
			description += `<small>${parseDate(item.created_at)}</small>`;
		}
		const link = originalItem.user?.screen_name && (originalItem.id_str || originalItem.conversation_id_str) ? `https://x.com/${originalItem.user?.screen_name}/status/${originalItem.id_str || originalItem.conversation_id_str}` : `https://x.com/${item.user?.screen_name}/status/${item.id_str || item.conversation_id_str}`;
		return {
			title,
			author: [{
				name: originalItem.user?.name,
				url: `https://x.com/${originalItem.user?.screen_name}`,
				avatar: originalItem.user?.profile_image_url_https
			}],
			description,
			pubDate: parseDate(item.created_at),
			link,
			guid: link.replace("x.com", "twitter.com"),
			category,
			_extra: isRetweet && { links: [{
				url: `https://x.com/${item.user?.screen_name}/status/${item.conversation_id_str}`,
				type: "repost"
			}] } || item.is_quote_status && item.quoted_status?.user && { links: [{
				url: `https://x.com/${item.quoted_status?.user?.screen_name}/status/${item.quoted_status?.id_str || item.quoted_status?.conversation_id_str}`,
				type: "quote"
			}] } || item.in_reply_to_screen_name && item.in_reply_to_status_id_str && { links: [{
				url: `https://x.com/${item.in_reply_to_screen_name}/status/${item.in_reply_to_status_id_str}`,
				type: "reply"
			}] }
		};
	});
};
const parseRouteParams = (routeParams) => {
	let count, include_replies, include_rts, only_media;
	let force_web_api = false;
	switch (routeParams) {
		case "exclude_rts_replies":
		case "exclude_replies_rts":
			include_replies = false;
			include_rts = false;
			break;
		case "include_replies":
			include_replies = true;
			include_rts = true;
			break;
		case "exclude_rts":
			include_replies = false;
			include_rts = false;
			break;
		default: {
			const parsed = new URLSearchParams(routeParams);
			count = fallback(void 0, queryToInteger(parsed.get("count")));
			include_replies = fallback(void 0, queryToBoolean(parsed.get("includeReplies")), false);
			include_rts = fallback(void 0, queryToBoolean(parsed.get("includeRts")), true);
			force_web_api = fallback(void 0, queryToBoolean(parsed.get("forceWebApi")), false);
			only_media = fallback(void 0, queryToBoolean(parsed.get("onlyMedia")), false);
		}
	}
	return {
		count,
		include_replies,
		include_rts,
		force_web_api,
		only_media
	};
};
const excludeRetweet = function(tweets) {
	const excluded = [];
	for (const t of tweets) {
		if (t.retweeted_status) continue;
		excluded.push(t);
	}
	return excluded;
};
const keepOnlyMedia = function(tweets) {
	return tweets.filter((t) => t.extended_entities && t.extended_entities.media);
};
var utils_default = {
	ProcessFeed,
	parseRouteParams,
	excludeRetweet,
	keepOnlyMedia
};
//#endregion
export { api_default as n, utils_default as t };
