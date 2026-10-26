import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/tumblr/utils.ts
const getAccessToken = async () => {
	let accessToken = await cache_default.get("tumblr:accessToken", false);
	if (!accessToken) try {
		const newAccessToken = await tokenRefresher();
		if (newAccessToken) accessToken = newAccessToken;
	} catch (error) {
		logger.error("Failed to refresh Tumblr token, using only client id as fallback", error);
	}
	return accessToken;
};
const generateAuthHeaders = async () => {
	const accessToken = await getAccessToken();
	if (!accessToken) return {};
	return { Authorization: `Bearer ${accessToken}` };
};
const generateAuthParams = () => config.tumblr.clientId;
const processPost = (post) => {
	let description = "";
	switch (post.type) {
		case "text":
			description = post.body;
			break;
		case "answer":
			description += post.asking_url === null ? `<p>${post.asking_name} asks:</p>` : `<p><a href="${post.asking_url}">${post.asking_name}</a> asks:</p>`;
			description += post.question;
			description += "<hr>";
			description += `<p><a href="${post.blog.url}">${post.blog_name}</a> answers:</p>`;
			description += post.answer;
			break;
		case "photo": {
			const photos = post.photos ?? [];
			for (const photo of photos) description += `<img src="${photo.original_size.url}"/><br/>`;
			break;
		}
		case "link":
			description = post.url;
			break;
		case "audio":
			description = post.embed;
			break;
		default: break;
	}
	return {
		author: post.blog_name,
		id: post.id_string,
		title: post.summary ?? `New post from ${post.blog_name}`,
		link: post.post_url,
		pubDate: parseDate(post.timestamp * 1e3),
		category: post.tags,
		description
	};
};
let tokenRefresher = () => Promise.resolve(null);
if (config.tumblr && config.tumblr.clientId && config.tumblr.clientSecret && config.tumblr.refreshToken) tokenRefresher = async () => {
	let refreshToken = config.tumblr.refreshToken;
	const previousRefreshTokenSerialized = await cache_default.get("tumblr:refreshToken", false);
	if (previousRefreshTokenSerialized) {
		const previousRefreshToken = JSON.parse(previousRefreshTokenSerialized);
		if (previousRefreshToken.startToken === refreshToken) refreshToken = previousRefreshToken.currentToken;
	}
	const response = await got_default.post("https://api.tumblr.com/v2/oauth2/token", { form: {
		grant_type: "refresh_token",
		client_id: config.tumblr.clientId,
		client_secret: config.tumblr.clientSecret,
		refresh_token: refreshToken
	} });
	if (!response.data?.access_token || !response.data?.refresh_token) return null;
	const accessToken = response.data.access_token;
	const newRefreshToken = response.data.refresh_token;
	const expiresIn = response.data.expires_in;
	await cache_default.set("tumblr:accessToken", accessToken, (expiresIn ?? 2520) - 30);
	const cacheEntry = {
		startToken: config.tumblr.refreshToken,
		currentToken: newRefreshToken
	};
	await cache_default.set("tumblr:refreshToken", JSON.stringify(cacheEntry), 31536e3);
	return accessToken;
};
var utils_default = {
	processPost,
	generateAuthParams,
	generateAuthHeaders
};
//#endregion
export { utils_default as t };
