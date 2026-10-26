import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { load } from "cheerio";
//#region lib/routes/codeforces/recent-actions.ts
const route = {
	path: "/recent-actions/:minrating?",
	categories: ["programming"],
	example: "/codeforces/recent-actions",
	parameters: { minrating: "The minimum blog/comment rating required. Default: 1" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["codeforces.com/recent-actions"],
		target: "/recent-actions"
	}],
	name: "Recent actions",
	maintainers: [],
	handler,
	url: "codeforces.com/recent-actions"
};
async function handler(ctx) {
	const minRating = ctx.req.param("minrating") || 1;
	return {
		title: "Codeforces - Recent actions",
		link: "https://codeforces.com/recent-actions",
		item: (await rofetch("https://codeforces.com/api/recentActions?maxCount=100")).result.map((action) => {
			const pubDate = /* @__PURE__ */ new Date(action.timeSeconds * 1e3);
			const blog = action.blogEntry;
			const blogId = blog.id;
			const blogTitle = load(blog.title).text();
			if (action.comment) {
				const c = action.comment;
				return {
					title: `@${c.commentatorHandle} commented on "${blogTitle}"`,
					description: load(c.text).text(),
					pubDate,
					link: `https://codeforces.com/blog/entry/${blogId}?#comment-${c.id}`,
					rating: c.rating
				};
			}
			return {
				title: `@${blog.authorHandle} posted "${blogTitle}"`,
				description: blogTitle,
				pubDate,
				link: `https://codeforces.com/blog/entry/${blogId}`,
				rating: blog.rating
			};
		}).filter((a) => a.rating >= minRating).map((a) => ({
			title: a.title,
			description: a.description,
			pubDate: a.pubDate,
			link: a.link
		}))
	};
}
//#endregion
export { route };
