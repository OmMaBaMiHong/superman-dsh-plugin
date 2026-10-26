import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/huggingface/blog.ts
const route = {
	path: "/blog",
	categories: ["programming"],
	example: "/huggingface/blog",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["huggingface.co/blog", "huggingface.co/"] }],
	name: "英文博客",
	maintainers: ["cesaryuan", "zcf0508"],
	handler,
	url: "huggingface.co/blog"
};
async function handler() {
	const { allBlogs } = await rofetch("https://huggingface.co/api/blog");
	const lists = allBlogs.map((blog) => ({
		title: blog.title,
		link: `https://huggingface.co${blog.url}`,
		pubDate: parseDate(blog.publishedAt),
		author: blog.authorsData.map((author) => ({ name: author.fullname || author.name })),
		upvotes: blog.upvotes,
		image: blog.thumbnail ? new URL(blog.thumbnail, "https://huggingface.co").href : void 0,
		category: blog.tags
	}));
	return {
		title: "Huggingface 英文博客",
		link: "https://huggingface.co/blog",
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
