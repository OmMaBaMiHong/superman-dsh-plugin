import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/southcn/templates/description.tsx
const SouthcnDescription = ({ thumb, description }) => /* @__PURE__ */ jsxs(Fragment, { children: [thumb ? /* @__PURE__ */ jsx("img", { src: thumb }) : null, description ? /* @__PURE__ */ jsx("blockquote", { children: /* @__PURE__ */ jsx("p", { children: description }) }) : null] });
const renderDescription = (data) => renderToString(/* @__PURE__ */ jsx(SouthcnDescription, { ...data }));
//#endregion
//#region lib/routes/southcn/nfapp/utils.ts
const parseArticle = (item) => cache_default.tryGet(item.link, async () => {
	const $ = load((await got_default({
		method: "get",
		url: item.link
	})).data);
	$(".article-nfh-icon, .article-crumb, .article-share, .article-copyright").remove();
	item.description += $("#content").html() ?? "";
	item.author = $("meta[name=\"author\"]").attr("content");
	return item;
});
//#endregion
export { renderDescription as n, parseArticle as t };
