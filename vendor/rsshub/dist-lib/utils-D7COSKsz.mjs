import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { jsx } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import bbobHTML from "@bbob/html";
import presetHTML5 from "@bbob/preset-html5";
//#region lib/routes/1point3acres/utils.tsx
const rootUrl = "https://instant.1point3acres.com";
const apiRootUrl = "https://api.1point3acres.com";
const types = {
	new: "最新帖子",
	hot: "热门帖子"
};
const swapLinebreak = (tree) => tree.walk((node) => {
	if (typeof node === "string" && node === "\n") return {
		tag: "br",
		content: null
	};
	return node;
});
const ProcessThreads = async (apiUrl, order) => {
	const response = await got_default({
		method: "get",
		url: apiUrl,
		headers: { referer: rootUrl }
	});
	return await Promise.all(response.data.threads.map((item) => {
		const result = {
			guid: item.tid,
			title: item.subject,
			author: item.author,
			link: `${rootUrl}/thread/${item.tid}`,
			description: item.summary,
			pubDate: parseDate((order === "" ? item.lastpost : item.dateline) * 1e3),
			category: [item.forum_name, ...item.tags ? item.tags.map((t) => t.displayname) : []]
		};
		return cache_default.tryGet(result.link, async () => {
			try {
				const thread = (await got_default({
					method: "get",
					url: `${apiRootUrl}/api/v3/threads/${result.guid}`,
					headers: { referer: rootUrl }
				})).data.thread;
				const customPreset = presetHTML5.extend((tags) => ({
					...tags,
					attach: (node, { render }) => {
						const id = render(node.content);
						const attachment = thread.attachment_list.find((a) => a.aid === Number.parseInt(id));
						if (attachment.isimage) return {
							tag: "img",
							attrs: { src: attachment.url }
						};
						return {
							tag: "a",
							attrs: {
								href: `https://www.1point3acres.com/bbs/plugin.php?id=attachcenter:page&aid=${id}`,
								rel: "noopener",
								target: "_blank"
							},
							content: `https://www.1point3acres.com/bbs/plugin.php?id=attachcenter:page&aid=${id}`
						};
					},
					url: (node) => {
						const link = Object.keys(node.attrs)[0];
						if (link.startsWith("https://link.1p3a.com/?url=")) return {
							tag: "a",
							attrs: {
								href: decodeURIComponent(link.replace("https://link.1p3a.com/?url=", "")),
								rel: "noopener",
								target: "_blank"
							},
							content: node.content
						};
						return {
							tag: "a",
							attrs: {
								href: link,
								rel: "noopener",
								target: "_blank"
							},
							content: node.content
						};
					}
				}));
				result.description = bbobHTML(thread.message_bbcode, [customPreset(), swapLinebreak]);
				if (!thread.message_bbcode.includes("[attach]") && thread.attachment_list.length > 0) for (const a of thread.attachment_list) result.description += a.isimage === 1 ? "<br>" + renderAttachmentImage(a.url, a.height, a.width) : "";
			} catch {}
			return result;
		});
	}));
};
const renderAttachmentImage = (url, height, width) => renderToString(/* @__PURE__ */ jsx("img", {
	src: url,
	height,
	width
}));
//#endregion
export { types as i, apiRootUrl as n, rootUrl as r, ProcessThreads as t };
