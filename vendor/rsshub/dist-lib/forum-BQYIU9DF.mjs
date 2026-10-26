import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import CryptoJS from "crypto-js";
//#region lib/routes/feng/utils.ts
const apiUrl = "https://api.wfdata.club";
const baseUrl = "https://www.feng.com";
const KEY = "2b7e151628aed2a6";
const getXRequestId = (apiUrl) => {
	const path = new URL(apiUrl).pathname;
	const plainText = CryptoJS.enc.Utf8.parse("url=" + path + "$time=" + Date.now() + "000000");
	const iv = CryptoJS.enc.Utf8.parse(KEY);
	return CryptoJS.AES.encrypt(plainText, iv, {
		iv,
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7
	}).toString();
};
const getCategory = (topicId) => {
	const url = `${apiUrl}/v1/topic/category`;
	return cache_default.tryGet(url, async () => {
		return (await got_default(url, { headers: {
			Referer: `${baseUrl}/forum/${topicId}`,
			"X-Request-Id": getXRequestId(url)
		} })).data;
	}, config.cache.routeExpire, false);
};
const getForumMeta = async (topicId) => {
	const categoryData = await getCategory(topicId);
	return Object.values(categoryData.data.dataList).find((item) => item.dataList.find((i) => i.topicId === topicId));
};
const getThreads = (topicId, type) => {
	const url = `${apiUrl}/v1/topic/${topicId}/thread?topicId=${topicId}&type=${type}&pageCount=50&order=${type === "newest" ? "replyTime" : "postTime"}&page=1`;
	return cache_default.tryGet(url, async () => {
		return (await got_default(url, { headers: {
			Referer: `${baseUrl}/forum/${topicId}`,
			"X-Request-Id": getXRequestId(url)
		} })).data;
	}, config.cache.routeExpire, false);
};
const getThread = (tid, topicId) => {
	const url = `${apiUrl}/v1/thread/${tid}`;
	return cache_default.tryGet(url, async () => {
		return (await got_default(url, { headers: {
			Referer: `${baseUrl}/forum/${topicId}`,
			"X-Request-Id": getXRequestId(url)
		} })).data;
	});
};
//#endregion
//#region lib/routes/feng/forum.tsx
const renderImages = (images) => renderToString(/* @__PURE__ */ jsx(Fragment, { children: images?.length ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("br", {}), images.map((image) => /* @__PURE__ */ jsx("img", {
	src: image.split("?", 1)[0],
	alt: ""
}))] }) : null }));
const deletedDescription = renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", {
	src: "https://www.feng.com/_nuxt/img/yishanchu.368ead2.png",
	alt: "威锋"
}), /* @__PURE__ */ jsx("div", {
	align: "center",
	children: "帖子已被删除"
})] }));
const route = {
	path: "/forum/:id/:type?",
	categories: ["bbs"],
	example: "/feng/forum/1",
	parameters: {
		id: "版块 ID，可在版块 URL 找到",
		type: "排序，见下表，默认为 `all`"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["feng.com/forum/photo/:id", "feng.com/forum/:id"],
		target: "/forum/:id"
	}],
	name: "社区",
	maintainers: ["TonyRL"],
	handler,
	description: `| 最新回复 | 最新发布 | 热门 | 精华    |
| -------- | -------- | ---- | ------- |
| newest   | all      | hot  | essence |`
};
async function handler(ctx) {
	const topicId = Number(ctx.req.param("id"));
	const { type = "all" } = ctx.req.param();
	const topicMeta = (await getForumMeta(topicId)).dataList.find((data) => data.topicId === topicId);
	const threads = (await getThreads(topicId, type)).data.dataList.map((data) => ({
		title: data.title,
		pubDate: parseDate(data.dateline * 1e3),
		author: data.userBaseInfo.userName,
		link: `${baseUrl}/post/${data.tid}`,
		tid: data.tid
	}));
	const posts = await Promise.all(threads.map(async (item) => {
		const thread = await getThread(item.tid, topicId);
		if (thread.status.code === 0) {
			const img = renderImages(thread.data.thread.fengTalkImage.length ? thread.data.thread.fengTalkImage : void 0);
			item.description = thread.data.thread.message + img;
		} else item.description = deletedDescription;
		delete item.tid;
		return item;
	}));
	return {
		title: `${topicMeta.topicName} - 社区 - 威锋 - 千万果粉大本营`,
		description: topicMeta.topicDescription,
		link: `${baseUrl}/forum/${topicId}`,
		item: posts
	};
}
//#endregion
export { route };
