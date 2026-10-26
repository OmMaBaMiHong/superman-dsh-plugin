import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { r as getSubPath } from "./common-utils-xJr7JYuG.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
import Parser from "rss-parser";
//#region lib/routes/nikkei/cn/index.ts
const parser = new Parser({
	customFields: { item: ["magnet"] },
	headers: { "User-Agent": config.ua },
	defaultRSS: .9
});
const route = {
	path: "/cn/*",
	name: "中文版新闻",
	example: "/nikkei/cn",
	maintainers: ["nczitzk"],
	handler,
	description: `::: tip
如 [中国 经济 日经中文网](https://cn.nikkei.com/china/ceconomy.html) 的 URL 为 \`https://cn.nikkei.com/china/ceconomy.html\` 对应路由为 [\`/nikkei/cn/cn/china/ceconomy\`](https://rsshub.app/nikkei/cn/cn/china/ceconomy)

如 [中國 經濟 日經中文網](https://zh.cn.nikkei.com/china/ceconomy.html) 的 URL 为 \`https://zh.cn.nikkei.com/china/ceconomy.html\` 对应路由为 [\`/nikkei/cn/zh/china/ceconomy\`](https://rsshub.app/nikkei/cn/zh/china/ceconomy)

特别地，当 \`path\` 填入 \`rss\` 后（如路由为 [\`/nikkei/cn/cn/rss\`](https://rsshub.app/nikkei/cn/cn/rss)），此时返回的是 [官方 RSS 的内容](https://cn.nikkei.com/rss.html)
:::`,
	radar: [{
		title: "中文版新闻",
		source: [
			"cn.nikkei.com/:category/:type",
			"cn.nikkei.com/:category",
			"cn.nikkei.com/"
		],
		target: (params) => {
			if (params.category && params.type) return `/nikkei/cn/cn/${params.category}/${params.type.replace(".html", "")}`;
			if (params.category && !params.type) return `/nikkei/cn/cn/${params.category.replace(".html", "")}`;
			return "/nikkei/cn/cn";
		}
	}, {
		title: "中文版新聞",
		source: [
			"zh.cn.nikkei.com/:category/:type",
			"zh.cn.nikkei.com/:category",
			"zh.cn.nikkei.com/"
		],
		target: (params) => {
			if (params.category && params.type) return `/nikkei/cn/zh/${params.category}/${params.type.replace(".html", "")}`;
			if (params.category && !params.type) return `/nikkei/cn/zh/${params.category.replace(".html", "")}`;
			return "/nikkei/cn/zh";
		}
	}]
};
async function handler(ctx) {
	let language;
	let path = getSubPath(ctx);
	if (/^\/cn\/(?:cn|zh)/.test(path)) {
		language = path.match(/^\/cn\/(cn|zh)/)[1];
		path = path.match(new RegExp(String.raw`\/cn\/` + language + "(.*)"))[1];
	} else language = "cn";
	const limit = ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 25;
	const rootUrl = `https://${language === "zh" ? "zh." : ""}cn.nikkei.com`;
	const isOfficialRSS = path === "/rss";
	const currentUrl = `${rootUrl}${path}${isOfficialRSS ? ".html" : ""}`;
	let officialFeed;
	let items;
	let $;
	if (isOfficialRSS) {
		officialFeed = await parser.parseURL(currentUrl);
		items = officialFeed.items.slice(0, limit).map((item) => ({
			title: item.title,
			link: new URL(item.link, rootUrl).href
		}));
	} else {
		$ = load((await got_default({
			method: "get",
			url: currentUrl
		})).data);
		const seenLinks = /* @__PURE__ */ new Set();
		items = $("dt a").toArray().map((item) => {
			item = $(item);
			return {
				title: item.text(),
				link: new URL(item.attr("href"), currentUrl).href
			};
		}).filter((item) => {
			if (seenLinks.has(item.link)) return false;
			seenLinks.add(item.link);
			return true;
		}).slice(0, limit);
	}
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: `${item.link}?print=1`
		})).data);
		const divs = content("#contentDiv div");
		divs.first().remove();
		divs.last().remove();
		item.pubDate = timezone(parseDate(item.link.match(/\/\d+-(.*?)\.html/)[1], "YYYY-MM-DD-HH-mm-ss"), 9);
		item.author = content("meta[name=\"author\"]").attr("content");
		item.title ??= content("meta[name=\"twitter:title\"]").attr("content");
		item.description = content("#contentDiv").html()?.replaceAll("&nbsp;", "").replaceAll("<p></p>", "");
		return item;
	})));
	return {
		title: isOfficialRSS ? officialFeed.title : $("title").first().text(),
		description: isOfficialRSS ? officialFeed.description : "",
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
