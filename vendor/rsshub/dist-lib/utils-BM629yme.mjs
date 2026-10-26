import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/oeeee/templates/description.tsx
const OeeeeDescription = ({ thumb, description }) => /* @__PURE__ */ jsxs(Fragment, { children: [thumb ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", { src: thumb }), /* @__PURE__ */ jsx("br", {})] }) : null, description ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("blockquote", { children: /* @__PURE__ */ jsx("p", { children: description }) }), /* @__PURE__ */ jsx("br", {})] }) : null] });
const renderDescription = (data) => renderToString(/* @__PURE__ */ jsx(OeeeeDescription, { ...data }));
//#endregion
//#region lib/routes/oeeee/utils.ts
const parseArticle = (item) => cache_default.tryGet(item.link, async () => {
	const content = load((await got_default({
		method: "get",
		url: item.link
	})).data);
	if (content(".post-cont") && content(".post-cont").html()) {
		content("img").removeAttr("data-width").removeAttr("data-height").removeAttr("class").removeAttr("title").removeAttr("referrerpolicy");
		content(".taglist, .J_ndlogo, .zan-shang, .sourcelist-box, #shareContain, .buyCopyright, .article-info, .icon, .special").remove();
		item.description += content(".post-cont").html().replaceAll(/data:image\S*=="\s*original="/g, "") ?? "";
		if (!item.pubDate) item.pubDate = timezone(parseDate(content(".introduce").text().split()), 8);
	} else if (content(".content") && content(".content").html()) item.description += content(".content").html() ?? "";
	else if (content(".article-conten") && content(".article-conten").html()) item.description += content(".article-conten").html() ?? "";
	return item;
});
//#endregion
export { renderDescription as n, parseArticle as t };
