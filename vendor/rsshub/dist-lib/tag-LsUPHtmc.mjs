import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as parser } from "./rss-parser-lNYr71DQ.mjs";
//#region lib/routes/qbitai/tag.ts
const route = {
	path: "/tag/:tag",
	categories: ["new-media"],
	example: "/qbitai/tag/大语言模型",
	parameters: { tag: "标签名" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["qbitai.com/tag/:tag"] }],
	name: "标签",
	maintainers: ["FuryMartin"],
	handler
};
async function handler(ctx) {
	const tag = ctx.req.param("tag");
	const link = encodeURI(`https://www.qbitai.com/tag/${tag}/feed`);
	const items = (await parser.parseURL(link)).items.map((item) => ({
		title: item.title,
		pubDate: parseDate(item.pubDate),
		link: item.link,
		author: "量子位",
		category: item.categories,
		description: item["content:encoded"]
	}));
	return {
		title: `量子位-${tag}`,
		link: `https://www.qbitai.com/tag/${tag}`,
		item: items
	};
}
//#endregion
export { route };
