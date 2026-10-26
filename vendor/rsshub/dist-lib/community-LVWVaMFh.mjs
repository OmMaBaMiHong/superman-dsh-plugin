import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { n as parseRelativeDate } from "./parse-date-Cr0wQjV_.mjs";
import { s as isYouTubeChannelId } from "./google-DbLLXUn8.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/youtube/community.tsx
const renderCommunityDescription = (runs, media) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [runs?.length ? runs.map((run) => {
	const url = run?.navigationEndpoint?.commandMetadata?.webCommandMetadata?.url;
	if (url) return /* @__PURE__ */ jsx("a", {
		href: url.startsWith("https://") ? url : `https://www.youtube.com${url}`,
		children: run.text
	});
	return /* @__PURE__ */ jsx(Fragment, { children: raw((run?.text ?? "").replaceAll("\n", "<br>")) });
}) : null, media?.length ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("br", {}), media.map((item) => item?.url ? /* @__PURE__ */ jsx("img", { src: item.url }) : null)] }) : null] }));
const route = {
	path: "/community/:handle",
	categories: ["social-media"],
	example: "/youtube/community/@JFlaMusic",
	parameters: { handle: "YouTube handles or channel id" },
	name: "Community Posts",
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	const handle = ctx.req.param("handle");
	let urlPath = handle;
	if (isYouTubeChannelId(handle)) urlPath = `channel/${handle}`;
	const $ = load(await rofetch(`https://www.youtube.com/${urlPath}/posts`));
	const ytInitialData = JSON.parse($("script").text().match(/ytInitialData = (\{.*?\});/)?.[1] ?? "{}");
	const channelMetadata = ytInitialData.metadata.channelMetadataRenderer;
	const username = channelMetadata.title;
	const list = ytInitialData.contents.twoColumnBrowseResultsRenderer.tabs.find((tab) => tab.tabRenderer.endpoint.commandMetadata.webCommandMetadata.url.endsWith("/posts") || tab.tabRenderer.endpoint.commandMetadata.webCommandMetadata.url.endsWith("/community")).tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents;
	if (list[0].messageRenderer) throw new Error(list[0].messageRenderer.text.runs[0].text);
	const items = list.filter((i) => i.backstagePostThreadRenderer).map((item) => {
		const post = item.backstagePostThreadRenderer.post.backstagePostRenderer || item.backstagePostThreadRenderer.post.sharedPostRenderer.originalPost.backstagePostRenderer;
		const media = post.backstageAttachment?.postMultiImageRenderer?.images.map((i) => i.backstageImageRenderer.image.thumbnails.pop()) ?? [post.backstageAttachment?.backstageImageRenderer?.image.thumbnails.pop()];
		return {
			title: post.contentText.runs?.[0].text ?? "",
			description: renderCommunityDescription(post.contentText.runs, media),
			link: `https://www.youtube.com/post/${post.postId}`,
			author: post.authorText.runs[0].text,
			pubDate: parseRelativeDate(post.publishedTimeText.runs[0].text.split("(", 1)[0])
		};
	});
	return {
		title: `${username} - Community Posts- YouTube`,
		link: channelMetadata.channelUrl,
		description: channelMetadata.description,
		item: items
	};
}
//#endregion
export { route };
