import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/cool18/index.ts
const route = {
	path: "/:id?/:type?/:keyword?",
	url: "cool18.com",
	example: "/cool18/bbs4",
	parameters: {
		id: "the name of the bbs, use `global` for site-wide search",
		type: "the type of the post. Can be `home`, `gold`, `threadsearch`. Default: `home`",
		keyword: "the keyword to search."
	},
	categories: ["bbs"],
	radar: [{
		source: ["cool18.com/:id/"],
		target: "/:id/:type?/:keyword?"
	}],
	name: "禁忌书屋",
	maintainers: ["nczitzk", "Gabrlie"],
	handler,
	features: { nsfw: true }
};
/**
* 构建请求 URL
*/
function buildUrl(rootUrl, type, keyword, isGlobal) {
	if (isGlobal && (type === "search" || type === "threadsearch")) return `${rootUrl}/search.php?keyword=${encodeURIComponent(keyword || "")}&sa=全成人区搜索`;
	return rootUrl + {
		home: "",
		gold: "?app=forum&act=gold",
		threadsearch: `?action=search&act=threadsearch&app=forum&keywords=${encodeURIComponent(keyword || "")}&submit=查询`,
		search: `?action=search&act=threadsearch&app=forum&keywords=${encodeURIComponent(keyword || "")}&submit=查询`
	}[type];
}
/**
* 从首页 JSON 数据中提取列表
*/
function extractHomeList($, rootUrl, limit) {
	try {
		const match = $("script:contains(\"_PageData\")").text().match(/const\s+_PageData\s*=\s*(\[[\s\S]*?\]);/);
		if (!match?.[1]) return [];
		return JSON.parse(match[1]).slice(0, limit).map((item) => ({
			title: item.subject,
			link: `${rootUrl}?app=forum&act=threadview&tid=${item.tid}`,
			pubDate: parseDate(item.dateline, "MM/DD/YY"),
			author: item.username,
			category: item.type ? [item.type] : [],
			description: ""
		}));
	} catch {
		return [];
	}
}
/**
* 从 HTML 列表中提取数据
*/
function extractHtmlList($, rootUrl, limit) {
	return $("#d_list ul li, #thread_list li, .t_l .t_subject, .post-list.thread-list li").slice(0, limit).toArray().map((item) => {
		const $item = $(item);
		const $link = $item.find("a").first();
		const href = $link.attr("href") || "";
		const categoryText = $link.find("span").first().text().trim();
		const authorFromFont = $item.find("font[color=\"black\"]").text().trim();
		const authorFromLink = $item.find("a").last().text().trim();
		const author = authorFromFont || authorFromLink;
		return {
			title: $link.text().trim(),
			link: href.startsWith("http") ? href : `${rootUrl}/${href}`,
			pubDate: parseDate($item.find("i").text(), "MM/DD/YY"),
			author,
			category: categoryText ? [categoryText] : [],
			description: ""
		};
	}).filter((item) => item.link);
}
/**
* 从全局搜索页面提取数据
*/
function extractGlobalSearchList($, limit) {
	return $(".search-content ul li").slice(0, limit).toArray().map((item) => {
		const $link = $(item).find("a").first();
		const href = $link.attr("href") || "";
		const $pElements = $link.find("p");
		const category = $pElements.filter(".lf").first().text().trim().replaceAll(/[【】]/g, "");
		const title = $pElements.filter(".lf").eq(1).text().trim();
		const dateText = $pElements.filter(".lr").text().trim();
		return {
			title: title || $link.text().trim(),
			link: href.startsWith("http") ? href : `https://www.cool18.com/${href}`,
			pubDate: parseDate(dateText, "YYYY-MM-DD HH:mm"),
			author: "",
			category: category ? [category] : [],
			description: ""
		};
	}).filter((item) => item.link && item.title);
}
/**
* 从 gold 页面提取精华帖子列表
*/
function extractGoldList($, rootUrl, limit) {
	return $(".section .post-list .post-item").slice(0, limit).toArray().map((item) => {
		const $link = $(item).find("a").first();
		const href = $link.attr("href") || "";
		return {
			title: $link.text().trim().replace(/^\.\s+/, ""),
			link: href.startsWith("http") ? href : `${rootUrl}/${href}`,
			pubDate: void 0,
			author: "",
			category: ["精华"],
			description: ""
		};
	}).filter((item) => item.link && item.title);
}
/**
* 获取文章详情内容
*/
async function fetchArticleDetail(item) {
	if (!item.link) return item;
	return await cache_default.tryGet(item.link, async () => {
		const preElement = load(await rofetch(item.link))("pre");
		if (preElement.length > 0) {
			const htmlContent = preElement.html();
			if (htmlContent) item.description = htmlContent.replaceAll("<font color=\"#E6E6DD\">cool18.com</font>", "");
		}
		return item;
	});
}
/**
* 主处理函数
*/
async function handler(ctx) {
	const { id = "bbs4", type = "home", keyword } = ctx.req.param();
	const postType = type;
	const isGlobal = id === "global";
	const rootUrl = isGlobal ? "https://www.cool18.com" : `https://www.cool18.com/${id}/index.php`;
	const currentUrl = buildUrl(rootUrl, postType, keyword, isGlobal);
	const $ = load(await rofetch(currentUrl));
	const limitQuery = ctx.req.query("limit");
	const limit = limitQuery ? Number(limitQuery) : 20;
	let list;
	if (isGlobal && (postType === "search" || postType === "threadsearch")) list = extractGlobalSearchList($, limit);
	else switch (postType) {
		case "home":
			list = extractHomeList($, rootUrl, limit);
			break;
		case "gold":
			list = extractGoldList($, rootUrl, limit);
			break;
		case "threadsearch":
		case "search":
			list = extractHtmlList($, rootUrl, limit);
			break;
		default:
			list = extractHtmlList($, rootUrl, limit);
			break;
	}
	const items = await Promise.all(list.map((item) => fetchArticleDetail(item)));
	return {
		title: $("title").text(),
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
