import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
import CryptoJS from "crypto-js";
//#region lib/routes/theblockbeats/index.tsx
const rootUrl = `https://www.theblockbeats.info`;
const apiBase = "https://api.blockbeats.cn";
const apiPrefix = "/v2";
const appKey = "bb_demo_app";
const appSecret = "bb_demo_secret_2026_01";
const createNonce = (length = 16) => {
	const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
	let nonce = "";
	for (let i = 0; i < length; i++) nonce += chars[Math.floor(Math.random() * 62)];
	return nonce;
};
const cleanQuery = (query) => Object.fromEntries(Object.entries(query).filter(([, value]) => value !== void 0));
const buildSignedHeaders = (path, query) => {
	const timestamp = Date.now().toString();
	const nonce = createNonce();
	const canonicalQuery = Object.keys(query).toSorted((a, b) => a.localeCompare(b)).map((key) => `${key}=${query[key] ?? ""}`).join("&");
	const signature = CryptoJS.HmacSHA256(`GET|${path}|${timestamp}|${nonce}|${canonicalQuery}`, appSecret).toString();
	return {
		"X-App-Key": appKey,
		"X-Timestamp": timestamp,
		"X-Nonce": nonce,
		"X-Signature": signature,
		"X-Encrypt": "false"
	};
};
const fetchApi = (path, query) => {
	const cleanedQuery = cleanQuery(query);
	return rofetch(`${apiBase}${apiPrefix}${path}`, {
		query: cleanedQuery,
		headers: buildSignedHeaders(`${apiPrefix}${path}`, cleanedQuery)
	});
};
const render = (data) => {
	const $ = load(renderToString(/* @__PURE__ */ jsx(BlockBeatsDescription, {
		image: data.image,
		description: data.description
	})), null, false);
	$("img").each((_, e) => {
		const $e = $(e);
		const src = $e.attr("src");
		$e.attr("src", src?.split("?", 1)[0]);
	});
	return $.html();
};
const BlockBeatsDescription = ({ image, description }) => /* @__PURE__ */ jsxs(Fragment, { children: [image ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", { src: image }), /* @__PURE__ */ jsx("br", {})] }) : null, description ? raw(description) : null] });
const channelMap = {
	newsflash: {
		title: "快讯",
		link: `${rootUrl}/newsflash`,
		api: "/newsflash/list"
	},
	article: {
		title: "文章",
		link: `${rootUrl}/article`,
		api: "/article/list"
	}
};
const route = {
	path: "/:channel?/:original?",
	categories: ["finance"],
	view: 0,
	example: "/theblockbeats/newsflash",
	parameters: {
		channel: {
			description: "类型",
			options: [{
				value: "newsflash",
				label: "快讯"
			}, {
				value: "article",
				label: "文章"
			}],
			default: "newsflash"
		},
		original: {
			description: "文章类型，仅 `channel` 为 `article` 时有效",
			options: [
				{
					value: "0",
					label: "全部"
				},
				{
					value: "1",
					label: "深度"
				},
				{
					value: "2",
					label: "精选"
				},
				{
					value: "3",
					label: "热点追踪"
				}
			],
			default: "0"
		}
	},
	name: "新闻快讯",
	maintainers: [
		"Fatpandac",
		"jameshih",
		"DIYgod"
	],
	handler,
	radar: [{
		title: "文章",
		source: ["www.theblockbeats.info/article"],
		target: "/article"
	}, {
		title: "快讯",
		source: ["www.theblockbeats.info/newsflash"],
		target: "/newsflash"
	}],
	description: `|    快讯   |   文章  |
| :-------: | :-----: |
| newsflash | article |

| 全部 | 深度 | 精选 | 热点追踪 |
| :--: | :--: | :--: | :------: |
|      |  -2  |   1  |     2    |`
};
async function handler(ctx) {
	const { channel = "newsflash", original } = ctx.req.param();
	let list = (await fetchApi(channelMap[channel].api, {
		limit: ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 20,
		original: channel === "article" ? original : void 0
	})).data.list.map((item) => ({
		title: item.title,
		link: `${rootUrl}/${channel === "newsflash" ? "flash" : "news"}/${item.article_id}`,
		description: item.content ?? item.abstract,
		pubDate: parseDate(item.add_time, "X"),
		author: item.author?.nickname,
		category: item.tag_list,
		articleId: item.article_id,
		image: item.img_url
	}));
	if (channel !== "newsflash") list = await Promise.all(list.map((item) => cache_default.tryGet(`theblockbeats:${item.link}`, async () => {
		const response = await fetchApi("/article/detail", { article_id: item.articleId });
		item.description = render({
			image: response.data.img_url || item.image,
			description: response.data.content || item.description
		});
		return item;
	})));
	const items = list.map(({ author, category, description, image, link, pubDate, title }) => ({
		title,
		link,
		description,
		pubDate,
		author,
		category,
		image
	}));
	return {
		title: `TheBlockBeats - ${channelMap[channel].title}`,
		link: channelMap[channel].link,
		item: items
	};
}
//#endregion
export { route };
