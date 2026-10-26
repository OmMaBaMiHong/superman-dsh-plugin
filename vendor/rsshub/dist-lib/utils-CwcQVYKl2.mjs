import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/penguin-random-house/utils.tsx
const parseBookInList = (element) => {
	const $ = load(element);
	const title = $("h2").first().text();
	const author = $("h2.author").first().text();
	const description = $(".desc").first().text();
	let imageSrc = $("img.cover__backcover").attr("src");
	let imageAlt = $("img.cover__backcover").attr("alt");
	if (!imageSrc) {
		imageSrc = $("img.img-responsive").attr("data-src");
		imageAlt = $("img.img-responsive").attr("alt");
	}
	return renderBookDescription(imageSrc, imageAlt, title, author, description);
};
const parsePubDate = (data) => {
	const dateString = data("script").toArray().find((element) => {
		const fullString = element.children[0];
		if (!fullString || !fullString.data) return false;
		return fullString.data.includes("post_date");
	});
	if (dateString.length === 0) return;
	const dateMatch = dateString.children[0].data.match(/(?<="post_date":").*?(?=")/);
	if (!dateMatch) return;
	return parseDate(dateMatch[0]);
};
const parseBooks = (element) => {
	const $ = load(element);
	return {
		description: $("h2.read-down-text").first().html(),
		content: $(".awesome-list>li").toArray().map((element) => parseBookInList(element)).join(""),
		pubDate: parsePubDate($)
	};
};
const parseArticle = (element) => {
	const $ = load(element);
	const description = $("h2.hdr-smalltxt").first().html();
	const imageSrc = $("div.img-block>img").first().attr("src");
	const imageAlt = $("div.img-block>img").first().attr("alt");
	return {
		description: renderArticleHeader(imageSrc, imageAlt, description),
		content: $("div.main-content>p,div.main-content>ul").toArray().map((element) => load(element).html()).join(""),
		pubDate: parsePubDate($)
	};
};
const parseList = (items, ctx, contentParser) => Promise.all(items.map((item) => cache_default.tryGet(item.url, async () => {
	const itemPage = (await got_default(item.url)).data;
	const itemParsed = contentParser(itemPage);
	return {
		title: item.title,
		description: itemParsed.description + "<br>" + itemParsed.content,
		pubDate: itemParsed.pubDate,
		link: item.url
	};
})));
const renderBookDescription = (imageSrc, imageAlt, title, author, description) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	/* @__PURE__ */ jsx("img", {
		src: imageSrc,
		alt: imageAlt
	}),
	/* @__PURE__ */ jsx("h1", { children: title }),
	/* @__PURE__ */ jsx("h3", { children: author }),
	/* @__PURE__ */ jsx("p", { children: description })
] }));
const renderArticleHeader = (imageSrc, imageAlt, description) => renderToString(/* @__PURE__ */ jsxs("p", { children: [
	/* @__PURE__ */ jsx("img", {
		src: imageSrc,
		alt: imageAlt
	}),
	/* @__PURE__ */ jsx("br", {}),
	description
] }));
var utils_default = {
	parseList,
	parseBooks,
	parseArticle
};
//#endregion
export { utils_default as t };
