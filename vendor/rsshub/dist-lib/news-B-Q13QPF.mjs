import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/nikkei/news.tsx
const route = {
	path: "/news/:category/:article_type?",
	categories: ["traditional-media"],
	example: "/nikkei/news/news",
	parameters: {
		category: "Category, see table below",
		article_type: "Only includes free articles, set `free` to enable, disabled by default"
	},
	radar: [{
		source: ["www.nikkei.com/:category/archive", "www.nikkei.com/:category"],
		target: "/:category"
	}],
	name: "News",
	maintainers: ["Arracc", "ladeng07"],
	handler,
	description: `| 総合 | オピニオン | 経済    | 政治     | 金融      | マーケット | ビジネス | マネーのまなび | テック     | 国際          | スポーツ | 社会・調査 | 地域  | 文化    | ライフスタイル |
| ---- | ---------- | ------- | -------- | --------- | ---------- | -------- | -------------- | ---------- | ------------- | -------- | ---------- | ----- | ------- | -------------- |
| news | opinion    | economy | politics | financial | business   | 不支持   | 不支持         | technology | international | sports   | society    | local | culture | lifestyle      |`
};
async function handler(ctx) {
	const baseUrl = "https://www.nikkei.com";
	const { category, article_type = "paid" } = ctx.req.param();
	const url = category === "news" ? `${baseUrl}/news/category/` : `${baseUrl}/${category}/archive/`;
	const data = (await got_default(url)).data;
	const $ = load(data);
	let categoryName;
	const listSelector = $("[class^=\"container_\"]  [class^=\"default_\"]:has(article)");
	const paidSelector = "img[class^=\"icon_\"]";
	let list = listSelector.toArray().map((item) => {
		item = $(item);
		item.find("p a").remove();
		return {
			title: item.find("[class^=\"titleLink_\"]").text(),
			link: `${baseUrl}${item.find("[class^=\"title_\"] a").attr("href")}`,
			image: item.find("[class^=\"image_\"] img").removeAttr("style").removeAttr("width").removeAttr("height").parent().html(),
			category: item.find("[class^=\"topicItem_\"] a").toArray().map((item) => $(item).text()),
			paywall: !!item.find(paidSelector).length
		};
	});
	if (category === "news") {
		categoryName = "総合";
		list = [...list, ...$("div#CONTENTS_MAIN .m-miM32_itemTitle").toArray().map((item) => {
			item = $(item);
			const a = item.find("a").first();
			return {
				title: a.text(),
				link: `${baseUrl}${a.attr("href")}`,
				category: item.find(".m-miM32_itemkeyword a").toArray().map((item) => $(item).text()),
				paywall: !!item.find(paidSelector).length
			};
		})];
	} else categoryName = $("h1.l-miH11_title").text().trim();
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: response } = await got_default(item.link);
		const $ = load(response);
		$(".notFloated_n1oadkwi").remove();
		item.pubDate = parseDate($("meta[property=\"article:published_time\"]").attr("content"));
		const description = $("section[class^=container_]").html();
		item.description = renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [item.paywall && item.image ? /* @__PURE__ */ jsxs(Fragment, { children: [raw(item.image), /* @__PURE__ */ jsx("br", {})] }) : null, description ? raw(description) : null] }));
		return item;
	})));
	return {
		title: "日本経済新聞 - " + categoryName,
		description: $("meta[name=\"description\"]").attr("content"),
		link: url,
		image: $("meta[property=\"og:image\"]").attr("content"),
		language: "ja",
		item: article_type === "free" ? items.filter((item) => !item.paywall) : items
	};
}
//#endregion
export { route };
