import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import markdownit from "markdown-it";
//#region lib/routes/manus/blog.ts
const md = markdownit({
	html: true,
	linkify: true
});
const route = {
	path: "/blog",
	categories: ["programming"],
	example: "/manus/blog",
	url: "manus.im",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["www.manus.im"],
		target: "/blog"
	}],
	name: "Blog",
	maintainers: ["cscnk52"],
	handler,
	description: "Manus Blog",
	view: 5
};
async function handler() {
	const rootUrl = "https://manus.im/blog";
	const renderData = await rofetch(rootUrl, {
		headers: { RSC: "1" },
		responseType: "text"
	});
	let blogList;
	const lines = renderData.split("\n");
	for (const line of lines) {
		if (!line.includes("{\"blogList\":{\"$typeName\"")) continue;
		const jsonStr = line.slice(Math.max(0, line.indexOf("{\"blogList\":{\"$typeName\"")));
		const lastBrace = jsonStr.lastIndexOf("}");
		try {
			blogList = JSON.parse(jsonStr.slice(0, Math.max(0, lastBrace + 1))).blogList;
			break;
		} catch {}
	}
	if (!blogList || !blogList.groups) throw new Error("Failed to parse blogList from RSC data");
	const list = blogList.groups.flatMap((group) => group.blogs?.map((blog) => ({
		title: blog.title,
		link: `https://manus.im/blog/${blog.recordUid}`,
		pubDate: /* @__PURE__ */ new Date(blog.createdAt.seconds * 1e3),
		description: blog.desc,
		category: [group.kindName],
		_contentUrl: blog.contentUrl
	})) ?? []);
	return {
		title: "Manus Blog",
		link: rootUrl,
		item: await Promise.all(list.map((item) => cache_default.tryGet(String(item.link), async () => {
			const contentUrl = item._contentUrl;
			let description = String(item.description);
			if (contentUrl) try {
				let contentText = await rofetch(contentUrl, { responseType: "text" });
				contentText = contentText.replaceAll(/!\[.*?\]\((.+?\.(mp4|mov|webm))\)/gi, "<video controls preload=\"metadata\"><source src=\"$1\"></video>");
				description = md.render(contentText);
			} catch {}
			delete item._contentUrl;
			return {
				...item,
				description
			};
		}))),
		language: "en"
	};
}
//#endregion
export { route };
