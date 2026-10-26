import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/furstar/utils.tsx
const base = "https://furstar.jp";
const langBase = (lang) => lang ? `${base}/${lang}` : base;
const renderAuthor = (author) => renderToString(/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("img", { src: author.avatar }), author.link === null ? /* @__PURE__ */ jsx("a", {
	href: "#",
	children: author.name
}) : /* @__PURE__ */ jsx("a", {
	href: author.link,
	children: author.name
})] }));
const renderDesc = (desc, pics, author) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	/* @__PURE__ */ jsx("p", { children: desc }),
	pics.map((pic) => /* @__PURE__ */ jsx("img", { src: pic })),
	raw(renderAuthor(author))
] }));
const authorDetail = (el) => {
	const $ = load(el);
	const a = $("a");
	const result = {
		name: null,
		avatar: null,
		link: null
	};
	if (a.length > 0) {
		const img = $("a img");
		result.name = img.attr("alt");
		result.avatar = img.attr("src");
		result.link = a.attr("href");
	} else {
		const desc = $("img");
		result.name = desc.attr("alt");
		result.avatar = desc.attr("src");
	}
	return result;
};
const detailPage = (link, cache) => cache.tryGet(link, async () => {
	const $ = load((await got_default(link)).data);
	const title = $(".row .panel-heading h2").text().trim();
	const desc = $(".character-description p").text().trim();
	return {
		title,
		pics: $(".img-gallery .prettyPhoto").toArray().map((e) => {
			const link = load(e)("a").attr("href").trim();
			return `${base}/${link.slice(2)}`;
		}),
		desc,
		author: authorDetail($(".character-description").html())
	};
});
const fetchAllCharacters = (data, base) => {
	return load(data)(".character-article").toArray().map((e) => {
		const c = load(e);
		return {
			title: c(".character-headline").text().trim(),
			headImage: c(".character-images img").attr("src").trim(),
			detailPage: `${base}/${c(".character-images a").attr("href").trim()}`,
			author: authorDetail(c(".character-description").html())
		};
	});
};
var utils_default = {
	BASE: base,
	langBase,
	fetchAllCharacters,
	detailPage,
	authorDetail,
	renderDesc,
	renderAuthor
};
//#endregion
export { utils_default as t };
