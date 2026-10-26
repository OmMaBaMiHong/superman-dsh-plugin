import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/luogu/user-blog.ts
const route = {
	path: "/user/blog/:name",
	categories: ["programming"],
	example: "/luogu/user/blog/ftiasch",
	parameters: { name: "博客名称" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["luogu.com/blog/:name"] }, { source: ["luogu.com.cn/blog/:name"] }],
	name: "用户博客",
	maintainers: ["ftiasch"],
	handler
};
async function handler(ctx) {
	const blogBaseUrl = `https://www.luogu.com.cn/blog/${ctx.req.param("name")}/`;
	const { uid: blogUid, title: blogTitle } = await cache_default.tryGet(blogBaseUrl, async () => {
		const $ = load(await rofetch(blogBaseUrl));
		return {
			uid: $("meta[name='blog-uid']").attr("content"),
			title: `${$("meta[name='blog-name']").attr("content")} - 洛谷博客`
		};
	});
	const posts = (await rofetch(`https://www.luogu.com.cn/api/blog/lists?uid=${blogUid}`)).data.result.map((r) => ({
		title: r.title,
		link: `${blogBaseUrl}${r.identifier}`,
		pubDate: /* @__PURE__ */ new Date(r.postTime * 1e3)
	}));
	return {
		title: blogTitle,
		link: blogBaseUrl,
		item: await Promise.all(posts.map((post) => cache_default.tryGet(post.link, async () => {
			const $ = load(await rofetch(post.link));
			return {
				title: post.title,
				link: post.link,
				pubDate: post.pubDate,
				description: $("#article-content").html()
			};
		})))
	};
}
//#endregion
export { route };
