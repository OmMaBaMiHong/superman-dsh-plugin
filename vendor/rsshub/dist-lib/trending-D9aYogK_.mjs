import { t as got_default } from "./got-Dnzt41dd.mjs";
import { i as keys, t as MEDIA_TYPE_TO_ITEM_HANDLE } from "./utils-DBaQ62o2.mjs";
//#region lib/routes/themoviedb/trending.ts
const MEDIA_TYPE_TO_TITLE = {
	tv: "TV Shows",
	movie: "Movies"
};
const route = {
	path: "/trending/:mediaType/:timeWindow/:lang?",
	categories: ["multimedia"],
	example: "/themoviedb/trending/tv/day/en-US",
	parameters: {
		mediaType: "`movie` or `tv`",
		timeWindow: "`day` or `week`",
		lang: "Language"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Trending",
	maintainers: ["x2cf"],
	handler
};
async function handler(ctx) {
	const { mediaType, timeWindow, lang } = ctx.req.param();
	const { data } = await got_default(`https://api.themoviedb.org/3/trending/${mediaType}/${timeWindow}`, { searchParams: {
		language: lang,
		api_key: keys()
	} });
	return {
		title: `Popular ${MEDIA_TYPE_TO_TITLE[mediaType]} — TMDB`,
		link: `https://www.themoviedb.org/${mediaType}`,
		item: data.results.map((item) => MEDIA_TYPE_TO_ITEM_HANDLE[mediaType](item, lang))
	};
}
//#endregion
export { route };
