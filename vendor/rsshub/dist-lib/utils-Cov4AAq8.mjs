import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import crypto from "node:crypto";
import * as cheerio from "cheerio";
//#region lib/routes/juejin/utils.ts
const b64tou8a = (str) => Uint8Array.from(Buffer.from(str, "base64"));
const b64tohex = (str) => Buffer.from(str, "base64").toString("hex");
const s256 = (s1, s2) => {
	const sha = crypto.createHash("sha256");
	sha.update(s1);
	sha.update(s2);
	return sha.digest("hex");
};
/**
* Solve _wafchallengeid
* @param cs - base64 encoded challenge string {"v":{"a":"...", "b":"timestamp", "c":"..."}, "s":"..."}
* @returns base64 encoded solved challenge string {"v":{"a":"...", "b":"timestamp", "c":"..."}, "s":"...", "d":"solution"}
*/
const solveWafChallenge = (cs) => {
	const c = JSON.parse(Buffer.from(cs, "base64").toString());
	const prefix = b64tou8a(c.v.a);
	const expect = b64tohex(c.v.c);
	for (let i = 0; i < 1e6; i++) if (s256(prefix, i.toString()) === expect) {
		c.d = Buffer.from(i.toString()).toString("base64");
		break;
	}
	return Buffer.from(JSON.stringify(c)).toString("base64");
};
const getArticle = async (link) => {
	let response = await rofetch(link);
	let $ = cheerio.load(response);
	if ($("script").text().includes("_wafchallengeid")) {
		const cs = $("script:contains(\"_wafchallengeid\")").text().match(/cs="(.*?)",c/)?.[1];
		response = await rofetch(link, { headers: { cookie: `_wafchallengeid=${solveWafChallenge(cs)};` } });
		$ = cheerio.load(response);
	}
	return $(".article-viewer").html();
};
const parseList = (data) => data.map((item) => {
	const isArticle = !!item.article_info;
	if (!!item.msg_Info) {
		const msg = item.msg_Info;
		const contentMatches = msg.content.match(/\[(.*?)\]\s+(.*)/);
		return {
			title: contentMatches?.[1],
			description: contentMatches?.[2]?.trim(),
			pubDate: parseDate(msg.ctime, "X"),
			author: item.author_user_info.user_name,
			link: `https://juejin.cn/pin/7548882523352186915${item.msg_id}`,
			category: [item.topic.title],
			isShortMsg: true
		};
	}
	return {
		title: isArticle ? item.article_info.title : item.content_info.title,
		description: (isArticle ? item.article_info.brief_content : item.content_info.brief) || "无描述",
		pubDate: parseDate(isArticle ? item.article_info.ctime : item.content_info.ctime, "X"),
		author: item.author_user_info.user_name,
		link: `https://juejin.cn${isArticle ? `/post/${item.article_id}` : `/news/${item.content_id}`}`,
		category: [.../* @__PURE__ */ new Set([item.category.category_name, ...item.tags.map((tag) => tag.tag_name)])]
	};
});
const ProcessFeed = (list) => Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
	item.description = item.isShortMsg ? item.description : await getArticle(item.link) || item.description;
	return item;
})));
const getCategoryBrief = () => cache_default.tryGet("juejin:categoryBriefs", async () => {
	return (await rofetch("https://api.juejin.cn/tag_api/v1/query_category_briefs")).data;
});
const getCollection = (collectionId) => cache_default.tryGet(`juejin:collectionId:${collectionId}`, async () => {
	return (await rofetch("https://api.juejin.cn/interact_api/v1/collectionSet/get", { query: {
		tag_id: collectionId,
		cursor: 0
	} })).data;
});
const getTag = (tag) => cache_default.tryGet(`juejin:tag:${tag}`, async () => {
	return (await rofetch("https://api.juejin.cn/tag_api/v1/query_tag_detail", {
		method: "POST",
		body: { key_word: tag }
	})).data;
});
const getTagList = () => cache_default.tryGet("juejin:tagList", async () => {
	return (await rofetch("https://api.juejin.cn/tag_api/v1/query_tag_list", {
		method: "POST",
		body: {
			key_word: "",
			status: [0],
			id_type: 1101,
			sort_type: 0,
			cursor: "0",
			limit: 100
		}
	})).data;
});
//#endregion
export { getTagList as a, getTag as i, getCategoryBrief as n, parseList as o, getCollection as r, solveWafChallenge as s, ProcessFeed as t };
