import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
//#region lib/routes/bsky/keyword.ts
const route = {
	path: "/keyword/:keyword",
	categories: ["social-media"],
	example: "/bsky/keyword/hello",
	parameters: { keyword: "N" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Keywords",
	maintainers: ["untitaker", "DIYgod"],
	handler
};
async function handler(ctx) {
	const keyword = ctx.req.param("keyword");
	const items = (await rofetch(`https://api.bsky.app/xrpc/app.bsky.feed.searchPosts?q=${encodeURIComponent(keyword)}&limit=25&sort=latest`)).posts.map((post) => ({
		title: post.record.text,
		link: `https://bsky.app/profile/${post.author.handle}/post/${post.uri.split("/").pop()}`,
		description: post.record.text,
		pubDate: new Date(post.record.createdAt),
		author: [{
			name: post.author.displayName,
			url: `https://bsky.app/profile/${post.author.handle}`,
			avatar: post.author.avatar
		}]
	}));
	return {
		title: `Bluesky Keyword - ${keyword}`,
		link: `https://bsky.app/search?q=${encodeURIComponent(keyword)}`,
		item: items
	};
}
//#endregion
export { route };
