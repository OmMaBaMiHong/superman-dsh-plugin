import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/4gamers/utils.tsx
const getCategories = () => cache_default.tryGet("4gamers:categories", async () => {
	const { data: response } = await got_default("https://www.4gamers.com.tw/site/api/news/category");
	return response.data.map((category) => ({
		id: category.id,
		name: category.name
	}));
});
const parseList = (results) => results.map((item) => ({
	title: item.title,
	author: item.author.nickname,
	intro: item.intro,
	pubDate: parseDate(item.createPublishedAt, "x"),
	link: item.canonicalUrl,
	category: [.../* @__PURE__ */ new Set([item.category.name, ...item.tags])],
	articleId: item.id
}));
const parseItem = async (item) => {
	const { data: response } = await got_default("https://www.4gamers.com.tw/site/api/news/find-section", { searchParams: { sub: item.articleId } });
	item.description = renderDescription(item.intro, response.data.contentSection.sections.map((section) => {
		switch (section["@type"]) {
			case "ContentAdsSection":
			case "InsertOneAdsSection":
			case "ScrollerAdsSection":
			case "textScrollerAdsSection": return "";
			case "RawHtmlSection": return section.html;
			case "ImageGroupSection": return renderImages(section.items);
			default: throw new InvalidParameterError(`Unhandled section type: ${section["@type"]} on ${item.link}`);
		}
	}).join(""));
	return item;
};
const renderDescription = (intro, content) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	/* @__PURE__ */ jsx("blockquote", { children: intro }),
	/* @__PURE__ */ jsx("br", {}),
	raw(content)
] }));
const renderImages = (images) => renderToString(/* @__PURE__ */ jsx(Fragment, { children: images.map((image) => /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", {
	src: image.url,
	alt: image.alt
}), /* @__PURE__ */ jsx("br", {})] })) }));
//#endregion
export { parseItem as n, parseList as r, getCategories as t };
