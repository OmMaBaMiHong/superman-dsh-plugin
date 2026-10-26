import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as md5 } from "./md5-CpIHIxCO.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { FetchError } from "ofetch";
//#region lib/routes/mangadex/_constants.ts
/**
* Define constants for the MangaDex.
*/
var _constants_default = {
	API: {
		/**
		* Base URL for the MangaDex API.
		*
		*/
		BASE: "https://api.mangadex.org",
		/**
		* Base URL for the fetching the manga details.
		*
		* @usage https://api.mangadex.org/manga/:id
		* @see https://api.mangadex.org/docs/redoc.html#tag/Manga/operation/get-manga-id
		* @usage https://api.mangadex.org/manga/:id/feed
		* @see https://api.mangadex.org/docs/redoc.html#tag/Manga/operation/get-manga-id-feed
		*/
		MANGA_META: "https://api.mangadex.org/manga/",
		/**
		* Base URL for a specific chapter in MangaDex Reading page.
		*
		* @usage https://api.mangadex.org/chapter/:chapterId
		* @see https://api.mangadex.org/docs/redoc.html#tag/Chapter/operation/get-chapter-id
		*/
		MANGA_CHAPTERS: "https://mangadex.org/chapter/",
		/**
		* Base URL for fetching the manga cover details.
		*
		* @usage https://api.mangadex.org/cover/:coverId
		* @usage https://api.mangadex.org/cover/?manga[]=:mangaId
		* @see https://api.mangadex.org/docs/swagger.html#/Cover/get-cover
		*/
		COVERS: "https://api.mangadex.org/cover/",
		/**
		* Base URL to retrieve the cover image.
		*
		* @usage https://uploads.mangadex.org/covers/:manga-id/:cover-filename
		* @usage https://uploads.mangadex.org/covers/:manga-id/:cover-filename.{256, 512}.jpg
		* @see https://api.mangadex.org/docs/03-manga/covers/
		*/
		COVER_IMAGE: "https://uploads.mangadex.org/covers/",
		/**
		* Get all Manga reading status for logged User
		*
		* @usage https://api.mangadex.org/manga/status
		* @note Requires authentication
		* @see https://api.mangadex.org/docs/redoc.html#tag/Manga/operation/get-manga-status
		*/
		READING_STATUSES: "https://api.mangadex.org/manga/status",
		/**
		* Retrieve a token for accessing the MangaDex API.
		*
		* @note Need configuration
		* @see https://api.mangadex.org/docs/02-authentication/personal-clients/
		*/
		TOKEN: "https://auth.mangadex.org/realms/mangadex/protocol/openid-connect/token",
		/**
		* Retrieve the user settings from MangaDex API.
		*
		* @note Requires authentication
		* @see https://api.mangadex.org/docs/redoc.html#tag/Settings/operation/get-settings
		*/
		SETTING: "https://api.mangadex.org/settings"
	},
	TOKEN_EXPIRE: 890
};
//#endregion
//#region lib/routes/mangadex/_access.ts
/**
* Retrieves an access token.
*
* @important Ensure the request includes a User-Agent header.
* @throws {ConfigNotFoundError} If the required configuration is missing.
* The following credentials are mandatory:
* - `client ID` and `client secret`
* - One of the following:
*   - `username` and `password`
*   - `refresh token`
* @throws {FetchError} If the request fails.
* - 400 Bad Request: If the `refresh token` or other credentials are invalid.
* @returns {Promise<string>} A promise that resolves to the access token.
*/
const getToken = () => {
	if (!config.mangadex.clientId || !config.mangadex.clientSecret) throw new ConfigNotFoundError("Cannot get access token since MangaDex client ID or secret is not set.");
	return cache_default.tryGet("mangadex:access-token", async () => {
		if (!config.mangadex.refreshToken) return getAccessTokenByUserCredentials();
		try {
			return await getAccessTokenByRefreshToken();
		} catch (error) {
			if (error instanceof FetchError && error.statusCode === 400) return getAccessTokenByUserCredentials();
			throw error;
		}
	}, _constants_default.TOKEN_EXPIRE, false);
};
const getAccessTokenByUserCredentials = async () => {
	if (!config.mangadex.clientId || !config.mangadex.clientSecret) throw new ConfigNotFoundError("Cannot get access token since MangaDex client ID or secret is not set.");
	if (!config.mangadex.username || !config.mangadex.password) throw new ConfigNotFoundError("Cannot get refresh token since MangaDex username or password is not set");
	const response = await got_default.post(_constants_default.API.TOKEN, {
		headers: { "User-Agent": config.trueUA },
		form: {
			grant_type: "password",
			username: config.mangadex.username,
			password: config.mangadex.password,
			client_id: config.mangadex.clientId,
			client_secret: config.mangadex.clientSecret
		}
	});
	const refreshToken = response?.data?.refresh_token;
	const accessToken = response?.data?.access_token;
	if (!refreshToken || !accessToken) throw new Error("Failed to retrieve refresh token from MangaDex API.");
	config.mangadex.refreshToken = refreshToken;
	return accessToken;
};
const getAccessTokenByRefreshToken = async () => {
	if (!config.mangadex.clientId || !config.mangadex.clientSecret) throw new ConfigNotFoundError("Cannot get access token since MangaDex client ID or secret is not set.");
	if (!config.mangadex.refreshToken) throw new ConfigNotFoundError("Cannot get access token since MangaDex refresh token is not set.");
	const accessToken = (await got_default.post(_constants_default.API.TOKEN, {
		headers: { "User-Agent": config.trueUA },
		form: {
			grant_type: "refresh_token",
			refresh_token: config.mangadex.refreshToken,
			client_id: config.mangadex.clientId,
			client_secret: config.mangadex.clientSecret
		}
	}))?.data?.access_token;
	if (!accessToken) throw new Error("Failed to retrieve access token from MangaDex API.");
	return accessToken;
};
//#endregion
//#region lib/routes/mangadex/_profile.ts
const getSetting = async () => {
	const accessToken = await getToken();
	return cache_default.tryGet("mangadex:settings", async () => {
		const setting = (await got_default.get(_constants_default.API.SETTING, { headers: {
			Authorization: `Bearer ${accessToken}`,
			"User-Agent": config.trueUA
		} }))?.data?.settings;
		if (!setting) throw new Error("Failed to retrieve user settings from MangaDex API.");
		return setting;
	}, config.cache.contentExpire, false);
};
const getFilteredLanguages = async (ingoreConfigNotFountError = true) => {
	try {
		return (await getSetting()).userPreferences.filteredLanguages;
	} catch (error) {
		if (ingoreConfigNotFountError && error instanceof ConfigNotFoundError) return [];
		throw error;
	}
};
//#endregion
//#region lib/routes/mangadex/_utils.ts
/**
* Get the first value that matches the keys in the source object
*
* @param source the source object
* @param keys the keys to search
* @returns the first match value, or the first value as fallback
*/
const firstMatch = (source, keys) => {
	for (const key of keys) {
		const value = source instanceof Map ? source.get(key) : source[key];
		if (value) return value;
	}
	return Object.values(source)[0];
};
/**
* Convert parameters to query string
*
* @param params parameters to be converted to query string
* @returns the query string
* @usage toQueryString({ a: 1, b: '2', c: [3, 4], d: {5: 'five', 6: 'six'} })
*   >> '?a=1&b=2&c[]=3&c[]=4&d[5]=five&d[6]=six'
*/
function toQueryString(params) {
	const queryParts = [];
	for (const [key, value] of Object.entries(params)) if (typeof value === "object" && !Array.isArray(value) && !(value instanceof Set)) {
		for (const [subKey, subValue] of Object.entries(value)) if (typeof subValue === "string" || typeof subValue === "number" || typeof subValue === "boolean") queryParts.push(`${encodeURIComponent(key)}[${encodeURIComponent(subKey)}]=${encodeURIComponent(subValue)}`);
	} else if (Array.isArray(value) || value instanceof Set) for (const item of value) queryParts.push(`${encodeURIComponent(key)}[]=${encodeURIComponent(item)}`);
	else queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
	if (queryParts.length === 0) return "";
	return "?" + queryParts.join("&");
}
//#endregion
//#region lib/routes/mangadex/_feed.ts
/**
* Retrieves the title, description, and cover of a manga.
*
* @author chrisis58, vzz64
* @param id manga id
* @param lang language(s), absent for default
* @param needCover whether to fetch cover
* @returns title, description, and cover of the manga
*/
const getMangaMeta = async (id, needCover = true, lang) => {
	const includes = needCover ? ["cover_art"] : [];
	const rawMangaMeta = await cache_default.tryGet(`mangadex:manga-meta:${id}`, async () => {
		const { data } = await got_default.get(`${_constants_default.API.MANGA_META}${id}${toQueryString({ includes })}`);
		if (data.result === "error") throw new Error(data.errors[0].detail);
		return data.data;
	});
	const relationships = rawMangaMeta.relationships || [];
	const languages = [
		...typeof lang === "string" ? [lang] : lang || [],
		...await getFilteredLanguages(),
		rawMangaMeta.attributes.originalLanguage
	].filter(Boolean);
	const title = firstMatch({
		...rawMangaMeta.attributes.title,
		...Object.fromEntries(rawMangaMeta.attributes.altTitles.flatMap((element) => Object.entries(element)))
	}, languages);
	const description = firstMatch(rawMangaMeta.attributes.description, languages);
	if (!needCover) return {
		title,
		description
	};
	const coverFilename = relationships.find((relationship) => relationship.type === "cover_art")?.attributes.fileName + ".512.jpg";
	return {
		title,
		description,
		cover: `${_constants_default.API.COVER_IMAGE}${id}/${coverFilename}`
	};
};
/**
* Retrieves the title, description, and cover of multiple manga.
* TODO: Retrieve page by page to avoid meeting the length limit of URL.
*
* @param ids manga ids
* @param needCover whether to fetch cover
* @param lang language(s), absent for default
* @returns a map of manga id to title, description, and cover
* @usage const mangaMetaMap = await getMangaMetaByIds(['f98660a1-d2e2-461c-960d-7bd13df8b76d']);
*/
async function getMangaMetaByIds(ids, needCover = true, lang) {
	const deDuplidatedIds = [...new Set(ids)].toSorted((a, b) => a.localeCompare(b));
	const includes = needCover ? ["cover_art"] : [];
	const rawMangaMetas = await cache_default.tryGet(`mangadex:manga-meta:${md5(deDuplidatedIds.join(""))}`, async () => {
		const { data } = await got_default.get(_constants_default.API.MANGA_META.slice(0, -1) + toQueryString({
			ids: deDuplidatedIds,
			includes,
			limit: deDuplidatedIds.length
		}));
		if (data.result === "error") throw new Error("Failed to retrieve manga meta from MangaDex API.");
		return data.data;
	});
	const languages = [...typeof lang === "string" ? [lang] : lang || [], ...await getFilteredLanguages()].filter(Boolean);
	const map = /* @__PURE__ */ new Map();
	for (const rawMangaMeta of rawMangaMetas) {
		const id = rawMangaMeta.id;
		const title = firstMatch({
			...rawMangaMeta.attributes.title,
			...Object.fromEntries(rawMangaMeta.attributes.altTitles.flatMap((element) => Object.entries(element)))
		}, [...languages, rawMangaMeta.attributes.originalLanguage]);
		const description = firstMatch(rawMangaMeta.attributes.description, languages);
		let cover;
		let manga = {
			id,
			title,
			description,
			cover
		};
		if (needCover) {
			const coverFilename = rawMangaMeta.relationships.find((relationship) => relationship.type === "cover_art")?.attributes.fileName;
			if (coverFilename) {
				cover = `${_constants_default.API.COVER_IMAGE}${rawMangaMeta.id}/${coverFilename}.512.jpg`;
				manga = {
					...manga,
					cover
				};
			}
		}
		map.set(id, manga);
	}
	return map;
}
/**
* Retrieves the chapters of a manga.
*
* @author chrisis58, vzz64
* @param id manga id
* @param lang language(s), absent for default
* @returns chapters of the manga
*/
const getMangaChapters = async (id, lang, limit) => {
	const languages = new Set([...typeof lang === "string" ? [lang] : lang || [], ...await getFilteredLanguages()].filter(Boolean));
	const url = `${_constants_default.API.MANGA_META}${id}/feed${toQueryString({
		order: { publishAt: "desc" },
		limit: limit || 100,
		translatedLanguage: languages
	})}`;
	const chapters = await cache_default.tryGet(`mangadex:manga-chapters:${id}`, async () => {
		const { data } = await got_default.get(url);
		if (data.result === "error") throw new Error(data.errors[0].detail);
		return data.data;
	}, config.cache.routeExpire, false);
	if (!chapters) return [];
	return chapters.map((chapter) => ({
		title: [
			chapter.attributes.volume ? `Vol. ${chapter.attributes.volume}` : null,
			chapter.attributes.chapter ? `Ch. ${chapter.attributes.chapter}` : null,
			chapter.attributes.title
		].filter(Boolean).join(" "),
		link: `${_constants_default.API.MANGA_CHAPTERS}${chapter.id}`,
		pubDate: new Date(chapter.attributes.publishAt)
	}));
};
/**
* Retrieves the title, description, cover, and chapters of a manga.
* Cominbation of getMangaMeta and getMangaChapters.
*
* @param id manga id
* @param lang language, absent for default
* @returns title, description, cover, and chapters of the manga
*/
const getMangaDetails = async (id, needCover = true, lang) => {
	const [meta, chapters] = await Promise.all([getMangaMeta(id, needCover, lang), getMangaChapters(id, lang)]);
	return {
		...meta,
		chapters
	};
};
//#endregion
export { getFilteredLanguages as a, toQueryString as i, getMangaDetails as n, getToken as o, getMangaMetaByIds as r, _constants_default as s, getMangaChapters as t };
