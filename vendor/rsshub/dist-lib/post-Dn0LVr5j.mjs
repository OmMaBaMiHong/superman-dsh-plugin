import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as fetchUserDate, t as baseUrl } from "./utils-BHHHKXKg.mjs";
import dayjs from "dayjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/zhiy/post.tsx
const renderDescription = (postMeta, postDate, posts) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	postMeta.visit_amount,
	"阅读 ",
	postMeta.note_amount,
	"条笔记 创建于",
	postDate,
	/* @__PURE__ */ jsx("br", {}),
	posts.map((post) => /* @__PURE__ */ jsxs(Fragment, { children: [
		(post.struct?.items ?? []).map((item) => {
			if (item.type === "text" || item.type === "link") return /* @__PURE__ */ jsx("span", { children: raw((item.content ?? "").replaceAll("\n", "<br>")) });
			if (item.type === "url") return /* @__PURE__ */ jsx("a", {
				href: item.url,
				children: item.content
			});
			return null;
		}),
		/* @__PURE__ */ jsx("br", {}),
		dayjs(post.publish_time_timestamp, "X").format("YYYY-MM-DD HH:mm:ss"),
		/* @__PURE__ */ jsx("hr", {})
	] }))
] }));
const route = {
	path: "/posts/:author",
	categories: ["new-media"],
	example: "/zhiy/posts/long",
	parameters: { author: "作者 ID，可在URL中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["zhiy.cc/:author"] }],
	name: "笔记",
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	const author = ctx.req.param("author");
	const { author_id: authorId, author_name: authorName, author_signature: authorSignature, author_avatar_url: authorAvatarUrl } = await fetchUserDate(author);
	const { data: { result: posts } } = await got_default(`${baseUrl}/api/app/share/garden/users/${authorId}/posts`, { searchParams: {
		page: 1,
		limit: ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 100
	} });
	const list = posts.map((item) => ({
		title: item.title,
		pubDate: parseDate(item.create_time, "X"),
		link: `${baseUrl}/b${item.share_md5}`,
		guid: `${baseUrl}/b${item.share_md5}:${item.link_amount}:${item.note_amount}`,
		postId: item.id,
		shareMD5: item.share_md5
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: postMeta } = await got_default(`${baseUrl}/api/app/share/posts/${item.shareMD5}`);
		const { data: { result: posts } } = await got_default(`${baseUrl}/api/app/share/posts/${item.postId}/notes`, { searchParams: {
			page: 1,
			limit: 100
		} });
		item.description = renderDescription(postMeta, dayjs(postMeta.create_time, "X").format("YYYY-MM-DD HH:mm:ss"), posts);
		return item;
	})));
	return {
		title: authorName,
		link: `${baseUrl}/${author}`,
		description: authorSignature,
		image: authorAvatarUrl,
		item: items
	};
}
//#endregion
export { route };
