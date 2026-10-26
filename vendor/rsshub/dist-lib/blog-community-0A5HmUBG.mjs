import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/huggingface/blog-community.ts
const route = {
	path: "/blog-community/:sort?",
	categories: ["programming"],
	example: "/huggingface/blog-community",
	parameters: { sort: {
		description: "Sort by trending or recent",
		default: "trending",
		options: [{
			value: "trending",
			label: "Trending"
		}, {
			value: "recent",
			label: "Recent"
		}]
	} },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["huggingface.co/blog/community", "huggingface.co/"] }],
	name: "Community Articles",
	maintainers: ["yuguorui"],
	handler,
	url: "huggingface.co/blog/community"
};
async function handler(ctx) {
	const { sort = "trending" } = ctx.req.param();
	const { posts } = await rofetch(`https://huggingface.co/api/blog/community?sort=${sort}`);
	const lists = posts.map((item) => ({
		title: item.title,
		link: `https://huggingface.co${item.url}`,
		pubDate: parseDate(item.publishedAt),
		author: item.authorsData?.[0]?.fullname || item.authorsData?.[0]?.name || "Unknown",
		upvotes: item.upvotes,
		image: item.thumbnail ? new URL(item.thumbnail, "https://huggingface.co").href : void 0
	}));
	return {
		title: "Huggingface Community Articles",
		link: "https://huggingface.co/blog/community",
		item: await Promise.all(lists.map((item) => cache_default.tryGet(item.link, async () => {
			const $ = load(await rofetch(item.link));
			$(".mb-4, .mb-6, .not-prose, h1").remove();
			return {
				...item,
				description: $(".blog-content").html() ?? void 0
			};
		})))
	};
}
//#endregion
export { route };
