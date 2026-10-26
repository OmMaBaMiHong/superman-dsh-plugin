import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/dcfever/utils.tsx
const baseUrl = "https://www.dcfever.com";
const renderTradeDescription = (info, description, photo) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	/* @__PURE__ */ jsx("h2", { children: info.find(".trading_item_title").text() }),
	info.find(".trading_item_type_tag").text(),
	" ",
	info.find(".trading_item_price").text(),
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsxs("table", { children: [
		/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "賣家" }), /* @__PURE__ */ jsx("td", { children: info.find(".clearfix .content").eq(0).text() })] }),
		/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "查詢次數" }), /* @__PURE__ */ jsx("td", { children: info.find(".clearfix .content").eq(1).text() })] }),
		/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "瀏覽次數" }), /* @__PURE__ */ jsx("td", { children: info.find(".clearfix .content").eq(2).text() })] }),
		/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "刊登日期" }), /* @__PURE__ */ jsx("td", { children: info.find(".clearfix .content").eq(3).text() })] }),
		/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "最後更新" }), /* @__PURE__ */ jsx("td", { children: info.find(".clearfix .content").eq(4).text() })] }),
		/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "刊登期至" }), /* @__PURE__ */ jsx("td", { children: info.find(".clearfix .content").eq(5).text() })] }),
		/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "刊登狀態" }), /* @__PURE__ */ jsx("td", { children: info.find(".clearfix .content").eq(6).text() })] })
	] }),
	/* @__PURE__ */ jsx("br", {}),
	description ? /* @__PURE__ */ jsx(Fragment, { children: raw(description) }) : null,
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsx("br", {}),
	photo ? /* @__PURE__ */ jsx(Fragment, { children: raw(photo) }) : null
] }));
const parseItem = (item) => cache_default.tryGet(item.link, async () => {
	const $ = load(await rofetch(item.link));
	const content = $("div[itemprop=\"articleBody\"], .column_article_content_html");
	const pageLinks = $(".article_multi_page a").not(".selected").toArray().map((i) => ({ link: new URL($(i).attr("href"), item.link).href }));
	if (pageLinks.length) {
		const pages = await Promise.all(pageLinks.map(async (pageLink) => {
			return load(await rofetch(pageLink.link))("div[itemprop=\"articleBody\"]").html();
		}));
		content.append(pages);
	}
	content.find("img").each((_, e) => {
		if (e.attribs.src?.includes("?")) e.attribs.src = e.attribs.src.split("?", 1)[0];
	});
	content.find("p a").each((_, e) => {
		e = $(e);
		if (e.text().startsWith("下一頁為")) e.remove();
	});
	content.find("iframe").each((_, e) => {
		e = $(e);
		if (e.attr("src").startsWith("https://www.facebook.com/plugins/like.php")) e.remove();
	});
	item.description = content.html();
	item.pubDate = parseDate($("meta[property=\"article:published_time\"]").attr("content"));
	return item;
});
const parseTradeItem = (item) => cache_default.tryGet(item.link, async () => {
	const $ = load(await rofetch(item.link));
	const $photo = load($("#trading_item_section .description").contents().filter((_, e) => e.type === "comment").toArray().map((e) => e.data).join(""), null, false);
	$photo(".selector_text").remove();
	$photo(".selector_image_div").each((_, div) => {
		delete div.attribs.onclick;
	});
	$photo(".desktop_photo_selector img").each((_, img) => {
		if (img.attribs.src.endsWith("_sqt.jpg")) img.attribs.src = img.attribs.src.replace("_sqt.jpg", ".jpg");
	});
	item.description = renderTradeDescription($(".info_col"), $(".description_text").html(), $photo(".desktop_photo_selector").html());
	return item;
});
//#endregion
export { parseItem as n, parseTradeItem as r, baseUrl as t };
