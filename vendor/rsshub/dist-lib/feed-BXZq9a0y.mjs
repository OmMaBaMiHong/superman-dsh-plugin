import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { a as getFilteredLanguages, i as toQueryString, o as getToken, r as getMangaMetaByIds, s as _constants_default } from "./_feed-Bglox1Bl.mjs";
//#region lib/routes/mangadex/mdlist/feed.ts
const DEFAULT_LIMIT = 25;
const route = {
	name: "MDList Feed",
	path: "/mdlist/:id/:lang?",
	radar: [{
		source: ["mangadex.org/list/:id/:suffix"],
		target: "/mdlist/:id"
	}],
	description: "Sepcific MangaDex MDList Feed",
	example: "/mangadex/mdlist/10cca803-8dc9-4f0e-86a8-6659a3ce5188?limit=10&private=true",
	maintainers: ["chrisis58"],
	categories: ["anime"],
	parameters: {
		id: { description: "The list id of the manga list" },
		private: { description: "(Query Param) Needed to access private lists, any value will be treated as true" }
	},
	features: {
		requireConfig: [
			{
				name: "MANGADEX_USERNAME",
				description: "MangaDex Username, required when refresh-token is not set and the list is private",
				optional: true
			},
			{
				name: "MANGADEX_PASSWORD",
				description: "MangaDex Password, required when refresh-token is not set and the list is private",
				optional: true
			},
			{
				name: "MANGADEX_CLIENT_ID",
				description: "MangaDex Client ID, required when the list is private",
				optional: true
			},
			{
				name: "MANGADEX_CLIENT_SECRET",
				description: "MangaDex Client Secret, required when the list is private",
				optional: true
			},
			{
				name: "MANGADEX_REFRESH_TOKEN",
				description: "MangaDex Refresh Token, required when username and password are not set and the list is private",
				optional: true
			}
		],
		nsfw: true
	},
	handler
};
async function handler(ctx) {
	const { id, lang } = ctx.req.param();
	const limit = ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : DEFAULT_LIMIT;
	const isPrivate = !!ctx.req.query("private");
	const accessToken = isPrivate ? await getToken() : void 0;
	const languagesQuery = new Set([...typeof lang === "string" ? [lang] : lang || [], ...await getFilteredLanguages()].filter(Boolean));
	const { listName, listAuthor } = await cache_default.tryGet(`mangadex:mdlist-info-${id}`, async () => {
		const mdlistInfo = (await got_default.get(`${_constants_default.API.BASE}/list/${id}${toQueryString({ includes: ["user"] })}`, { headers: {
			Authorization: isPrivate ? `Bearer ${accessToken}` : "",
			"User-Agent": config.trueUA
		} }))?.data?.data;
		if (!mdlistInfo) throw new Error("Failed to retrieve user follows from MangaDex API.");
		return {
			listName: mdlistInfo.attributes.name,
			listAuthor: mdlistInfo.relationships.find((relationship) => relationship.type === "user")?.attributes.username
		};
	}, config.cache.contentExpire);
	const feed = await cache_default.tryGet(`mangadex:mdlist-feed-${id}`, async () => {
		const feed = (await got_default.get(`${_constants_default.API.BASE}/list/${id}/feed${toQueryString({
			limit,
			translatedLanguage: languagesQuery,
			order: { publishAt: "desc" }
		})}`, { headers: {
			Authorization: isPrivate ? `Bearer ${accessToken}` : "",
			"User-Agent": config.trueUA
		} }))?.data?.data;
		if (!feed) throw new Error("Failed to retrieve user follows from MangaDex API.");
		return feed;
	}, config.cache.routeExpire, false);
	const mangaMetas = await getMangaMetaByIds(feed.map((chapter) => chapter?.relationships.find((relationship) => relationship.type === "manga")?.id));
	return {
		title: `MDList - ${listName} by ${listAuthor}`,
		link: `https://mangadex.org/list/${id}?tab=feed`,
		description: "The latest updates of all the manga in a sepcific list",
		item: feed.map((chapter) => {
			const mangaId = chapter.relationships.find((relationship) => relationship.type === "manga")?.id;
			const mangaMeta = mangaMetas.get(mangaId);
			const chapterTitile = [
				chapter.attributes.volume ? `Vol. ${chapter.attributes.volume}` : null,
				chapter.attributes.chapter ? `Ch. ${chapter.attributes.chapter}` : null,
				chapter.attributes.title
			].filter(Boolean).join(" ");
			return {
				title: mangaMeta?.title || "Unknown",
				link: `${_constants_default.API.MANGA_CHAPTERS}${chapter.id}`,
				pubDate: new Date(chapter.attributes.publishAt),
				description: chapterTitile,
				image: mangaMeta?.cover
			};
		})
	};
}
//#endregion
export { route };
