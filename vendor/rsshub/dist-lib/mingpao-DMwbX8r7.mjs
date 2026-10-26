import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as parser } from "./rss-parser-lNYr71DQ.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import * as cheerio from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/mingpao/index.tsx
const renderFanBox = (media) => renderToString(/* @__PURE__ */ jsx(Fragment, { children: media?.map((item, index) => item.video ? /* @__PURE__ */ jsx("video", {
	controls: true,
	preload: "metadata",
	poster: item.video.replace(".mp4", ".jpg"),
	children: /* @__PURE__ */ jsx("source", {
		src: item.video,
		type: "video/mp4"
	})
}, `video-${index}`) : /* @__PURE__ */ jsxs("figure", { children: [/* @__PURE__ */ jsx("img", {
	src: item.href,
	alt: item.title
}), /* @__PURE__ */ jsx("figcaption", { children: item.title })] }, `image-${index}`)) }));
const renderDesc = (media, desc) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [raw(renderFanBox(media)), raw(desc)] }));
const fixFancybox = (element, $) => {
	const $e = $(element);
	const url = new URL($e.attr("href"));
	let video;
	if (url.hostname === "videop.mingpao.com") {
		video = new URL(url.searchParams.get("file"));
		video.hostname = "cfrvideo.mingpao.com";
		video = video.href;
	}
	return {
		href: url.href,
		title: $e.attr("title"),
		video
	};
};
const route = {
	path: "/:type?/:category?",
	name: "新聞",
	example: "/mingpao/ins/all",
	parameters: {
		type: {
			description: "新聞類型",
			default: "ins",
			options: [{
				value: "ins",
				label: "即時新聞"
			}, {
				value: "pns",
				label: "每日明報"
			}]
		},
		category: "頻道，見下表"
	},
	radar: [{
		title: "即時新聞",
		source: ["news.mingpao.com/ins/:categoryName/section/:date/:category"],
		target: "/mingpao/ins/:category"
	}, {
		title: "每日明報",
		source: ["news.mingpao.com/pns/:categoryName/section/:date/:category"],
		target: "/mingpao/pns/:category"
	}],
	maintainers: ["TonyRL"],
	handler,
	description: `| category | 即時新聞頻道 |
| -------- | ------------ |
| all      | 總目錄       |
| s00001   | 港聞         |
| s00002   | 經濟         |
| s00003   | 地產         |
| s00004   | 兩岸         |
| s00005   | 國際         |
| s00006   | 體育         |
| s00007   | 娛樂         |
| s00022   | 文摘         |
| s00024   | 熱點         |

| category | 每日明報頻道 |
| -------- | ------------ |
| s00001   | 要聞         |
| s00002   | 港聞         |
| s00003   | 社評         |
| s00004   | 經濟         |
| s00005   | 副刊         |
| s00011   | 教育         |
| s00012   | 觀點         |
| s00013   | 中國         |
| s00014   | 國際         |
| s00015   | 體育         |
| s00016   | 娛樂         |
| s00017   | English      |
| s00018   | 作家專欄     |`
};
async function handler(ctx) {
	const type = ctx.req.param("type") ?? "ins";
	const link = `https://news.mingpao.com/rss/${type}/${ctx.req.param("category") ?? (type === "ins" ? "all" : "s00001")}.xml`;
	const feed = await parser.parseURL(link);
	const items = await Promise.all(feed.items.map((item) => cache_default.tryGet(item.link, async () => {
		const response = await rofetch(item.link, { headers: { Referer: "https://news.mingpao.com/" } });
		const $ = cheerio.load(response);
		const topVideo = $("#topvideo").length ? $("#topvideo iframe").toArray().map((e) => $(e).attr("href", $(e).attr("src"))).map((e) => fixFancybox(e, $)) : [];
		const fancyboxImg = $("a.fancybox").length ? $("a.fancybox") : $("a.fancybox-buttons");
		$("div.ad300ins_m").remove();
		$("div.clear, div.inReadLrecGroup, div.clr").remove();
		$("div#ssm2").remove();
		$("iframe").remove();
		$("p[dir=ltr]").remove();
		item.category = item.categories;
		let fancybox = [...topVideo, ...fancyboxImg.toArray().map((e) => fixFancybox(e, $))];
		const script = $("script").toArray().find((e) => $(e).text()?.includes("$('#lower').prepend('"));
		const lowerContent = script ? $(script).text()?.match(/\$\('#lower'\)\.prepend\('(.*)'\);/)?.[1]?.replaceAll(String.raw`\"`, "\"") : "";
		if (lowerContent) {
			const $ = cheerio.load(lowerContent, null, false);
			fancybox = [...fancybox, ...$("a.fancybox").toArray().map((e) => fixFancybox(e, $))];
		}
		delete item.categories;
		delete item.content;
		delete item.contentSnippet;
		delete item.creator;
		delete item.isoDate;
		item.description = renderDesc(fancybox, $(".txt4").html() ?? $(".article_content.line_1_5em").html() ?? $(".txt3").html());
		item.pubDate = parseDate(item.pubDate);
		item.guid = item.link.includes("?") ? item.link : item.link.slice(0, item.link.lastIndexOf("/"));
		return item;
	})));
	return {
		title: feed.title,
		link: feed.link,
		description: feed.description,
		item: items,
		image: feed.image.url,
		language: feed.language
	};
}
//#endregion
export { route };
