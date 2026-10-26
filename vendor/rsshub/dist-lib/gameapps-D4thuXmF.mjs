import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as parser } from "./rss-parser-lNYr71DQ.mjs";
import { Fragment, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/gameapps/index.tsx
const route = {
	path: "/",
	example: "/gameapps",
	categories: ["game"],
	radar: [{ source: ["gameapps.hk/"] }],
	name: "最新消息",
	maintainers: ["TonyRL"],
	handler,
	url: "gameapps.hk/"
};
async function handler() {
	const baseUrl = "https://www.gameapps.hk";
	const feed = await parser.parseURL(`${baseUrl}/rss`);
	const items = await Promise.all(feed.items.map((item) => cache_default.tryGet(item.link, async () => {
		const $ = load(await rofetch(item.link, { headers: { Referer: baseUrl } }));
		item.title = ($("meta[property=\"og:title\"]").attr("content") ?? $(".news-title h1").text()).replace(" - 香港手機遊戲網 GameApps.hk", "");
		item.category = $(".tags-wrap .tag-item").toArray().map((el) => $(el).text().trim().replace(/^#/, ""));
		$(".pages, .article-ad, .social-actions, .news-footer").remove();
		delete item.content;
		delete item.contentSnippet;
		delete item.isoDate;
		const intro = $("div.introduction.media.news-intro div.media-body").html()?.trim();
		const desc = $(".article-content, .news-content").html()?.trim();
		item.description = renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [intro ? raw(intro) : null, desc ? raw(desc) : null] }));
		item.guid = item.guid.slice(0, item.link.lastIndexOf("/"));
		item.pubDate = parseDate(item.pubDate);
		item.enclosure_url = $("div.introduction.media.news-intro div.media-left").find("img").attr("src");
		item.enclosure_type = "image/jpeg";
		return item;
	})));
	return {
		title: feed.title,
		link: feed.link,
		description: feed.description,
		image: `${baseUrl}/static/favicon/apple-touch-icon.png`,
		item: items,
		language: feed.language
	};
}
//#endregion
export { route };
