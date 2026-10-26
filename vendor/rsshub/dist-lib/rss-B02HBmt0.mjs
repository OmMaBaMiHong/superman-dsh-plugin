import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { t as parser } from "./rss-parser-lNYr71DQ.mjs";
import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/eprice/rss.tsx
const allowRegion = /* @__PURE__ */ new Set(["tw", "hk"]);
const route = {
	path: "/:region?",
	categories: ["new-media"],
	example: "/eprice/tw",
	parameters: { region: "地区，预设为 tw" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "最新消息",
	maintainers: ["TonyRL"],
	handler,
	description: `地区：

| hk   | tw   |
| ---- | ---- |
| 香港 | 台湾 |`
};
async function handler(ctx) {
	const region = ctx.req.param("region") ?? "tw";
	if (!allowRegion.has(region)) throw new InvalidParameterError("Invalid region");
	const feed = await parser.parseURL(`https://www.eprice.com.${region}/news/rss.xml`);
	for (const e of feed.items) e.link = e.link.replace(/^http:\/\//i, "https://");
	const items = await Promise.all(feed.items.map((item) => cache_default.tryGet(item.link, async () => {
		const $ = load((await got_default(item.link, { headers: { Referer: `https://www.eprice.com.${region}` } })).data);
		$("noscript").remove();
		$("div[id^=dablewidget]").remove();
		$("div[class^=parallax-ads]").remove();
		$(".adsbygoogle, .join-eprice-fb, .teads").remove();
		$("div.ad-336x280-g, div.ad-728x90-g").remove();
		$("div.clear, div.news-vote, div.signature").remove();
		$("ul.inner, ul.navigator, ul.infobar").remove();
		$("iframe[src^=\"https://www.facebook.com/plugins/like.php\"]").remove();
		item.category = item.categories;
		$("a").each((_, e) => {
			e = $(e);
			if (e.attr("href") && e.attr("href").endsWith(".jpg")) {
				e.after(renderToString(/* @__PURE__ */ jsxs("figure", { children: [/* @__PURE__ */ jsx("img", {
					src: e.attr("href"),
					alt: e.attr("title") ?? "",
					title: e.attr("title") ?? ""
				}), /* @__PURE__ */ jsx("figcaption", { children: e.attr("title") ?? "" })] })));
				e.remove();
			}
		});
		$("img").each((_, e) => {
			e = $(e);
			if (e.attr("data-original")) e.attr("src", e.attr("data-original"));
		});
		delete item.categories;
		delete item.content;
		delete item.contentSnippet;
		delete item.creator;
		delete item.enclosure;
		delete item.isoDate;
		item.description = $("div.user-comment-block").html() || $("div.content").html() || $("li.inner").html() || $("div.section-content").html() || $(".article__content").html();
		item.pubDate = parseDate(item.pubDate);
		return item;
	})));
	const ret = {
		title: feed.title,
		link: feed.link,
		description: feed.description,
		item: items,
		image: feed.image.url,
		language: feed.language
	};
	ctx.set("json", ret);
	return ret;
}
//#endregion
export { route };
