import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { t as isValidHost } from "./valid-host-BH9Dd2Pf.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/myfigurecollection/index.tsx
const shortcuts = {
	potd: "picture/browse/potd/",
	potw: "picture/browse/potw/",
	potm: "picture/browse/potm/"
};
const route = {
	path: "/:category?/:language?",
	categories: ["shopping"],
	example: "/myfigurecollection/potd",
	parameters: {
		category: "分类，默认为每日圖片",
		language: "语言，见上表，默认为空，即 `en`"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["zh.myfigurecollection.net/browse", "zh.myfigurecollection.net/"] }],
	name: "圖片",
	maintainers: ["nczitzk"],
	handler,
	url: "zh.myfigurecollection.net/browse",
	description: `| 每日圖片 | 每週圖片 | 每月圖片 |
| -------- | -------- | -------- |
| potd     | potw     | potm     |`
};
async function handler(ctx) {
	const language = ctx.req.param("language") ?? "";
	const category = ctx.req.param("category") ?? "figure";
	if (language && !isValidHost(language)) throw new InvalidParameterError("Invalid language");
	const rootUrl = `https://${language === "en" || language === "" ? "" : `${language}.`}myfigurecollection.net`;
	const currentUrl = `${rootUrl}/${Object.hasOwn(shortcuts, category) ? shortcuts[category] : category}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	let items = $(".item-icon, .picture-icon").slice(0, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 25).toArray().map((item) => {
		item = $(item).find("a");
		const link = item.attr("href");
		return { link: link.startsWith("http") ? link : `${rootUrl}${link}` };
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		try {
			const content = load((await got_default({
				method: "get",
				url: item.link
			})).data);
			item.title = content(".headline").text();
			const pictures = /myfigurecollection\.net\/picture\//.test(item.link) ? [{ src: content("meta[property=\"og:image\"]").attr("content") }] : JSON.parse(decodeURIComponent(content("meta[name=\"pictures\"]").attr("content")));
			item.description = renderDescription(pictures, content(".form-field").toArray().map((f) => ({
				key: content(f).find(".form-label").text(),
				value: content(f).find(".form-input").text()
			})));
		} catch {
			item.title = `Item #${item.link.split("/").pop()}`;
		}
		return item;
	})));
	return {
		title: $("title").text().replace(/ \(.*\)/, ""),
		link: currentUrl,
		item: items
	};
}
const renderDescription = (pictures, fields) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [pictures?.map((picture, index) => /* @__PURE__ */ jsx("img", {
	src: picture.src,
	weight: picture.w,
	height: picture.h
}, `${picture.src}-${index}`)), fields.length ? /* @__PURE__ */ jsx("table", { children: /* @__PURE__ */ jsx("tbody", { children: fields.map((field, index) => /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: field.key }), /* @__PURE__ */ jsx("td", { children: field.value })] }, `${field.key}-${index}`)) }) }) : null] }));
//#endregion
export { route };
