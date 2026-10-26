import { t as parser } from "./rss-parser-lNYr71DQ.mjs";
import { i as processItems } from "./utils-Bpk3tkLu.mjs";
//#region lib/routes/chikubi/nipple-video-maker.ts
const route = {
	path: "/nipple-video-maker/:keyword",
	categories: ["multimedia"],
	example: "/chikubi/nipple-video-maker/nipple-video-maker-nh",
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
	name: "AVメーカー",
	maintainers: ["SnowAgar25"],
	handler,
	radar: [{
		title: "AVメーカー",
		source: ["chikubi.jp/nipple-video-maker/:keyword"],
		target: "/nipple-video-maker/:keyword"
	}]
};
async function handler(ctx) {
	const { keyword } = ctx.req.param();
	const baseUrl = "https://chikubi.jp";
	const url = `/nipple-video-maker/${encodeURIComponent(keyword)}`;
	const feed = await parser.parseURL(`${baseUrl}${url}/feed`);
	const items = await processItems(feed.items.map((item) => ({
		title: item.title,
		link: item.link
	})));
	return {
		title: `AVメーカー: ${feed.title?.split("-", 1)[0]} - chikubi.jp`,
		link: `${baseUrl}${url}`,
		item: items
	};
}
//#endregion
export { route };
