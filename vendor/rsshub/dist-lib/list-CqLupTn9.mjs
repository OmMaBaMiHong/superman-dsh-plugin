import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/ynet/list.ts
const defaultCategory = "news";
const defaultId = "2121t76";
async function getFinalContentAndUrl(url, redirects = 0, maxRedirects = 5) {
	if (redirects > maxRedirects) return [await rofetch(url), url];
	const responseContent = await rofetch(url);
	const nextUrl = responseContent.match(/(?:location\.href|window\.location\.replace)\s*=\s*['"](.*?)['"];/i)?.[1];
	if (nextUrl) return getFinalContentAndUrl(nextUrl, redirects + 1, maxRedirects);
	return [responseContent, url];
}
const handler = async (ctx) => {
	const params = ctx.req.param();
	let category;
	let id;
	const paramKeys = Object.keys(params);
	if (paramKeys.length === 2) {
		category = params[paramKeys[0]];
		id = params[paramKeys[1]];
	} else if (paramKeys.length === 1) {
		category = "";
		id = params[paramKeys[0]];
	} else {
		category = defaultCategory;
		id = defaultId;
	}
	category = category.replaceAll(/[^a-z0-9-]/gi, "");
	const limit = Number(ctx.req.query("limit") ?? "30");
	const baseUrl = `https://${category ? `${category}.` : ""}ynet.com`;
	const targetUrl = new URL(`list/${id}.html`, baseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "zh";
	let items = $("li.cfix").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		const $aEl = $el.find("h2 a");
		const title = $aEl.text();
		const pubDateStr = $el.find("em.fRight").text();
		const linkUrl = $aEl.attr("href");
		const upDatedStr = pubDateStr;
		return {
			title,
			pubDate: pubDateStr ? timezone(parseDate(pubDateStr), 8) : void 0,
			link: linkUrl,
			updated: upDatedStr ? timezone(parseDate(upDatedStr), 8) : void 0,
			language
		};
	});
	items = await Promise.all(items.map((item) => {
		if (!item.link) return item;
		return cache_default.tryGet(item.link, async () => {
			const [detailResponse, finalUrl] = await getFinalContentAndUrl(item.link);
			const $$ = load(detailResponse);
			item.link = finalUrl;
			const title = $$("div.articleTitle h1").text();
			const description = $$("div#articleBox").html() ?? void 0;
			const pubDateStr = $$("span.yearMsg").text() && $$("span.timeMsg").text() ? `${$$("span.yearMsg").text()} ${$$("span.timeMsg").text()}` : void 0;
			const authors = $$("spna.sourceMsg").text();
			const upDatedStr = pubDateStr;
			const processedItem = {
				title,
				description,
				pubDate: pubDateStr ? timezone(parseDate(pubDateStr), 8) : item.pubDate,
				author: authors,
				content: {
					html: description,
					text: description
				},
				updated: upDatedStr ? timezone(parseDate(upDatedStr), 8) : item.updated,
				language
			};
			return {
				...item,
				...processedItem
			};
		});
	}));
	return {
		title: $("title").text(),
		description: $("meta[property=\"og:description\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("div.cul_logo img").attr("src") ? `https:${$("div.cul_logo img").attr("src")}` : void 0,
		author: $("meta[property=\"og:site_name\"]").attr("content"),
		language,
		id: targetUrl
	};
};
const route = {
	path: "/list/:category?/:id?",
	name: "列表",
	url: "ynet.com",
	maintainers: ["nczitzk"],
	handler,
	example: "/ynet/list/news/2121t76",
	parameters: {
		category: { description: "分类，默认为 `news`，可在对应分类页 URL 中找到" },
		id: { description: "列表 ID，可在对应列表页 URL 中找到" }
	},
	description: `::: tip
订阅 [北青快讯](https://news.ynet.com/list/2121t76.html)，其源网址为 \`https://news.ynet.com/list/2121t76.html\`，请参考该 URL 指定部分构成参数，此时路由为 [\`/ynet/list/news/2121t76\`](https://rsshub.app/ynet/list/news/2121t76)。
:::`,
	categories: ["new-media"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportRadar: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["ynet.com"],
		target: (_, url) => {
			const urlObj = new URL(url);
			const domainParts = urlObj.hostname.split(".");
			let category = "";
			if (domainParts.length > 2) {
				const subdomains = domainParts.slice(0, -2).filter((part) => part !== "www");
				if (subdomains.length > 0) category = subdomains[0];
			}
			const idMatch = urlObj.pathname.match(/\/list\/(.+)\.html/);
			const id = idMatch ? idMatch[1] : "";
			return `/ynet/list${category ? `/${category}` : ""}${id ? `/${id}` : ""}`;
		}
	}],
	view: 0
};
//#endregion
export { handler, route };
