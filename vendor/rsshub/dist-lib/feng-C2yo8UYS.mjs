import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { jsx } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/ifeng/utils.tsx
const extractDoc = (data) => data.map((item) => {
	const type = item.type;
	if (type === "video") return renderVideo(item.data);
	if (type === "text") return item.data.replaceAll(/data-lazyload=(.+?) src=(.+?) style=".+?"/g, "src=$1");
	return "";
}).join("<br>");
const renderVideo = (videoInfo) => renderToString(videoInfo.mobileUrl ? /* @__PURE__ */ jsx("video", {
	controls: true,
	poster: videoInfo.bigPosterUrl,
	preload: "metadata",
	children: /* @__PURE__ */ jsx("source", {
		src: videoInfo.mobileUrl,
		type: "video/mp4"
	})
}) : null);
//#endregion
//#region lib/routes/ifeng/feng.ts
const route = {
	path: "/feng/:id/:type",
	categories: ["new-media"],
	example: "/ifeng/feng/2583/doc",
	parameters: {
		id: "对应 id，可在 大风号作者页面 找到",
		type: "类型，见下表"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "大风号",
	maintainers: ["Jamch"],
	handler,
	description: `| 文章 | 视频  |
| ---- | ----- |
| doc  | video |`
};
async function handler(ctx) {
	const { id, type } = ctx.req.param();
	const { data: userResponse } = await got_default(`https://ishare.ifeng.com/mediaShare/home/${id}/media`, { headers: { Referer: `https://feng.ifeng.com/author/${id}` } });
	const { data: contentResponse } = await got_default(`https://shankapi.ifeng.com/season/ishare/getShareListData/${id}/${type}/1/ifengnewsh5/getListData`, { headers: { Referer: `https://feng.ifeng.com/author/${id}` } });
	const $ = load(userResponse);
	const { sockpuppetInfo: allData } = JSON.parse($("script").text().match(/var allData = (.*?);/)[1]);
	const { data: contentData } = JSON.parse(contentResponse.match(/getListData\((.*)\)/)[1]);
	const { weMediaName: mediaName, honorDesc, description, logo } = allData;
	const list = contentData.map((item) => ({
		title: item.title,
		pubDate: timezone(parseDate(item.newsTime), 8),
		author: mediaName,
		link: `https:${item.url}`
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: response } = await got_default(item.link);
		const $ = load(response);
		const _allData = JSON.parse($("script").text().match(/var allData = (\{.*?\});/)[1]);
		if (type === "doc") item.description = extractDoc(_allData.docData.contentData.contentList);
		else if (type === "video") item.description = renderVideo(_allData.videoInfo);
		item.category = _allData.keywords.split(",");
		item.author = _allData.docData?.editorName ?? item.author;
		return item;
	})));
	return {
		title: `大风号-${mediaName}-${type === "doc" ? "文章" : "视频"}`,
		description: `${honorDesc} ${description}`,
		image: `https:${logo}`,
		link: `https://ishare.ifeng.com/mediaShare/home/${id}/media`,
		item: items
	};
}
//#endregion
export { route };
