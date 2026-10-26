import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { i as processWork, r as processCreator, t as baseUrl } from "./utils-B2jWrP_y2.mjs";
//#region lib/routes/skeb/index.ts
const categoryMap = {
	new_art_works: "新着作品 (Illust)",
	new_voice_works: "新着作品 (Voice)",
	new_novel_works: "新着作品 (Novel)",
	new_video_works: "新着作品 (Video)",
	new_music_works: "新着作品 (Music)",
	new_correction_works: "新着作品 (Advice)",
	new_comic_works: "新着作品 (Comic)",
	popular_works: "人気の作品 (Popular)",
	popular_creators: "人気クリエイター",
	new_creators: "新着クリエイター"
};
const workCategories = /* @__PURE__ */ new Set([
	"new_art_works",
	"new_voice_works",
	"new_novel_works",
	"new_video_works",
	"new_music_works",
	"new_correction_works",
	"new_comic_works",
	"popular_works"
]);
const route = {
	path: "/:category",
	categories: ["picture"],
	example: "/skeb/new_art_works",
	parameters: { category: "Category, the div id of the section title on the homepage." },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	name: "Skeb",
	maintainers: ["SnowAgar25"],
	handler,
	radar: [
		{
			title: "新着作品 (Illust)",
			source: ["skeb.jp"],
			target: "/new_art_works"
		},
		{
			title: "新着作品 (Voice)",
			source: ["skeb.jp"],
			target: "/new_voice_works"
		},
		{
			title: "新着作品 (Novel)",
			source: ["skeb.jp"],
			target: "/new_novel_works"
		},
		{
			title: "新着作品 (Video)",
			source: ["skeb.jp"],
			target: "/new_video_works"
		},
		{
			title: "新着作品 (Music)",
			source: ["skeb.jp"],
			target: "/new_music_works"
		},
		{
			title: "新着作品 (Advice)",
			source: ["skeb.jp"],
			target: "/new_correction_works"
		},
		{
			title: "新着作品 (Comic)",
			source: ["skeb.jp"],
			target: "/new_comic_works"
		},
		{
			title: "人気の作品 (Popular)",
			source: ["skeb.jp"],
			target: "/popular_works"
		},
		{
			title: "人気クリエイター",
			source: ["skeb.jp"],
			target: "/popular_creators"
		},
		{
			title: "新着クリエイター",
			source: ["skeb.jp"],
			target: "/new_creators"
		}
	]
};
async function handler(ctx) {
	const category = ctx.req.param("category") || "new_art_works";
	if (!Object.hasOwn(categoryMap, category)) throw new Error("Invalid category");
	const url = `${baseUrl}/api`;
	const apiData = await cache_default.tryGet(url, async () => {
		return await rofetch(url);
	}, config.cache.routeExpire, false);
	if (!apiData || typeof apiData !== "object") throw new Error("Invalid data received from API");
	const items = await cache_default.tryGet(category, async () => {
		if (!Object.hasOwn(apiData, category) || !Array.isArray(apiData[category])) return [];
		const processItem = workCategories.has(category) ? processWork : processCreator;
		return await Promise.all(apiData[category].map(async (item) => await processItem(item)).filter(Boolean));
	});
	return {
		title: `Skeb - ${categoryMap[category]}`,
		link: `${baseUrl}/#${category}`,
		item: items
	};
}
//#endregion
export { route };
