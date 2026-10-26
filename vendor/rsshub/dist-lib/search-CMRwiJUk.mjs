import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as getPosts } from "./utils-Bpk3tkLu.mjs";
//#region lib/routes/chikubi/search.ts
const route = {
	path: "/search/:keyword",
	categories: ["multimedia"],
	example: "/chikubi/search/ギャップ",
	parameters: { keyword: "Keyword" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	name: "Search",
	maintainers: ["SnowAgar25"],
	handler
};
async function handler(ctx) {
	const { keyword } = ctx.req.param();
	const baseUrl = "https://chikubi.jp";
	const searchUrl = `${baseUrl}/wp-json/wp/v2/search?search=${keyword}`;
	const items = await getPosts((await got_default.get(searchUrl)).data.map((item) => item.id.toString()));
	return {
		title: `Search: ${keyword} - chikubi.jp`,
		link: `${baseUrl}/search/${encodeURIComponent(keyword)}`,
		item: items
	};
}
//#endregion
export { route };
