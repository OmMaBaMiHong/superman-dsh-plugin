import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
import iconv from "iconv-lite";
//#region lib/routes/flyert/templates/description.tsx
const renderDescription = ({ images, intro, description }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	images?.length ? images.map((image) => image?.src ? /* @__PURE__ */ jsx("figure", { children: image.alt ? /* @__PURE__ */ jsx("img", {
		src: image.src,
		alt: image.alt
	}) : /* @__PURE__ */ jsx("img", { src: image.src }) }) : null) : null,
	intro ? /* @__PURE__ */ jsx("blockquote", { children: intro }) : null,
	description ? raw(description) : null
] }));
//#endregion
//#region lib/routes/flyert/util.ts
const rootUrl = "https://www.flyert.com.cn";
/**
* Parses a list of articles based on a CheerioAPI object and a limit.
* @param $ The CheerioAPI object.
* @param limit The maximum number of articles to parse.
* @returns An array of parsed article objects.
*/
const parseArticleList = ($, limit) => $("div.comiis_wzli").slice(0, limit).toArray().map((item) => {
	item = $(item);
	const title = item.find("div.wzbt").text().trim();
	const image = item.find("div.wzpic img").prop("src");
	const description = renderDescription({
		images: image ? [{
			src: image,
			alt: title
		}] : void 0,
		description: item.find("div.wznr").html()
	});
	const pubDate = item.find("div.subcat span.y").contents()?.eq(2)?.text().trim() ?? void 0;
	const link = new URL(item.find("div.wzbt a").prop("href"), rootUrl).href;
	return {
		title,
		description,
		pubDate: pubDate ? parseDate(pubDate) : void 0,
		link,
		author: item.find("div.subcat span.y a").first().text(),
		content: {
			html: description,
			text: item.find("div.wznr").text()
		},
		image,
		banner: image
	};
});
/**
* Parses a list of posts based on a CheerioAPI object and a limit.
* @param $ The CheerioAPI object.
* @param limit The maximum number of posts to parse.
* @returns An array of parsed post objects.
*/
const parsePostList = ($, limit) => $("div.comiis_postlist").toArray().filter((item) => {
	item = $(item);
	return item.find("span.comiis_common a[data-track]").toArray().some((a) => {
		a = $(a);
		return (a.attr("data-track") || "").endsWith("文章");
	});
}).slice(0, limit).map((item) => {
	item = $(item);
	const aEl = $(item.find("span.comiis_common a[data-track]").toArray().find((a) => {
		a = $(a);
		return (a.attr("data-track") || "").endsWith("文章");
	}));
	const pubDate = item.find("span.author_b span").prop("title") || void 0;
	return {
		title: aEl.text().trim(),
		pubDate: pubDate ? parseDate(pubDate) : void 0,
		link: new URL(aEl.prop("href"), rootUrl).href,
		author: item.find("a.author_t").text().trim()
	};
});
/**
* Parses an article based on a CheerioAPI object and an item.
* @param $$ The CheerioAPI object.
* @param item The item to parse.
* @returns The parsed article object.
*/
const parseArticle = ($$, item) => {
	const title = $$("h1.ph").text().trim();
	const description = renderDescription({
		intro: $$("div.s").text() || void 0,
		description: $$("div#artMain").html()
	});
	const pubDate = $$("p.xg1").contents().first().text().trim()?.match(/(\d{4}-\d{1,2}-\d{1,2}\s\d{2}:\d{2})/)?.[1] ?? void 0;
	const guid = `flyert-${item.link.split(/=/).pop()}`;
	item.title = title;
	item.description = description;
	item.pubDate = pubDate ? timezone(parseDate(pubDate), 8) : item.pubDate;
	item.author = $$("p.xg1 a").first().text();
	item.guid = guid;
	item.id = guid;
	item.content = {
		html: description,
		text: $$("div#artMain").text()
	};
	return item;
};
/**
* Parses a post based on a CheerioAPI object and an item.
* @param $$ The CheerioAPI object.
* @param item The item to parse.
* @returns The parsed post object.
*/
const parsePost = ($$, item) => {
	$$("img.zoom").each((_, el) => {
		el = $$(el);
		el.replaceWith(renderDescription({ images: el.prop("zoomfile") || el.prop("file") ? [{
			src: el.prop("zoomfile") || el.prop("file"),
			alt: el.prop("alt") || el.prop("title")
		}] : void 0 }));
	});
	$$("i.pstatus").remove();
	$$("div.tip").remove();
	const title = $$("span#thread_subject").text().trim();
	const description = $$("div.post_message").first().html();
	const pubDate = $$("span[title]").first().prop("title");
	const tid = item.link.match(/tid=(\d+)/)?.[1] ?? void 0;
	const guid = tid ? `flyert-${tid}` : void 0;
	item.title = title;
	item.description = description;
	item.pubDate = pubDate ? timezone(parseDate(pubDate), 8) : item.pubDate;
	item.author = $$("a.kmxi2").first().text();
	item.guid = guid;
	item.id = guid;
	item.content = {
		html: description,
		text: $$("div.post_message").first().text()
	};
	return item;
};
//#endregion
//#region lib/routes/flyert/forum.ts
const handler = async (ctx) => {
	const { params } = ctx.req.param();
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 5;
	const decodedParams = params ? decodeURIComponent(params).split(/&/).filter((p) => p.split(/=/).length === 2).join("&") : void 0;
	const currentUrl = new URL(`forum.php${decodedParams ? `?${decodedParams}` : ""}`, rootUrl).href;
	const { data: response } = await got_default(currentUrl, { responseType: "buffer" });
	const $ = load(iconv.decode(response, "gbk"));
	const language = $("meta[http-equiv=\"Content-Language\"]").prop("content");
	let items = $("table#threadlisttableid").length === 0 ? parseArticleList($, limit) : parsePostList($, limit);
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: detailResponse } = await got_default(item.link, { responseType: "buffer" });
		const $$ = load(iconv.decode(detailResponse, "gbk").replaceAll(/<\/?ignore_js_op>/g, ""));
		item = $$("div.firstpost").length === 0 ? parseArticle($$, item) : parsePost($$, item);
		item.language = language;
		return item;
	})));
	const image = `https:${$("div.wp h2 a img").prop("src")}`;
	return {
		title: `飞客 - ${$("a.forum_name, li.a, li.cur, li.xw1, div.z > a.xw1").toArray().map((a) => $(a).text()).join(" - ")}`,
		description: $("meta[name=\"description\"]").prop("content"),
		link: currentUrl,
		item: items,
		allowEmpty: true,
		image,
		author: $("meta[name=\"application-name\"]").prop("content")
	};
};
const route = {
	path: "/forum/:params{.+}?",
	name: "会员说",
	url: "www.flyert.com.cn",
	maintainers: ["nczitzk"],
	handler,
	example: "/flyert/forum",
	parameters: { params: "参数，默认为空，可在对应分类页 URL 中找到" },
	description: `::: tip
若订阅 [酒店集团优惠](https://www.flyert.com.cn/forum.php?mod=forumdisplay\\&sum=all\\&fid=all\\&catid=322\\&filter=sortid\\&sortid=144\\&searchsort=1\\&youhui_type=19)，网址为 \`https://www.flyert.com.cn/forum.php?mod=forumdisplay&sum=all&fid=all&catid=322&filter=sortid&sortid=144&searchsort=1&youhui_type=19\`。截取 \`https://www.flyert.com.cn/forum.php?\` 到末尾的部分 \`mod=forumdisplay&sum=all&fid=all&catid=322&filter=sortid&sortid=144&searchsort=1&youhui_type=19\` **进行 UrlEncode 编码** 后作为参数填入，此时路由为 [\`/flyert/forum/mod%3Dforumdisplay%26sum%3Dall%26fid%3Dall%26catid%3D322%26filter%3Dsortid%26sortid%3D144%26searchsort%3D1%26youhui_type%3D226\`](https://rsshub.app/flyert/forum/mod%3Dforumdisplay%26sum%3Dall%26fid%3Dall%26catid%3D322%26filter%3Dsortid%26sortid%3D144%26searchsort%3D1%26youhui_type%3D226)。
:::`,
	categories: ["bbs"],
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
		source: ["www.flyert.com.cn/forum.php"],
		target: (_, url) => {
			const params = url.searchParams.entries().toArray().map(([key, value]) => key + "=" + value).join("&");
			return `/forum${params ? `/${encodeURIComponent(params)}` : ""}`;
		}
	}]
};
//#endregion
export { handler, route };
