import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import markdownit from "markdown-it";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/utgd/utils.tsx
const md = markdownit({ html: true });
const rootUrl = "https://utgd.net";
const apiRootUrl = "https://api.utgd.net";
const parseResult = (results, limit) => results.slice(0, limit).map((item) => ({
	id: item.id,
	title: item.title,
	link: `${rootUrl}/article/${item.id}`,
	author: item.article_author_displayname,
	pubDate: timezone(parseDate(item.article_published_time), 8),
	category: item.article_category.map((c) => c.category_name)
}));
const parseArticle = (item) => cache_default.tryGet(`untag-${item.id}`, async () => {
	const data = await rofetch(`${apiRootUrl}/api/v2/article/${item.id}/`);
	item.description = renderDescription(data.article_image, data.article_for_membership, md.render(data.article_content));
	item.category = [...data.article_category.map((c) => c.category_name), ...data.article_tag.map((t) => t.tag_name)];
	return item;
});
const renderDescription = (image, membership, description) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	image ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", { src: image }), /* @__PURE__ */ jsx("br", {})] }) : null,
	membership ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("br", {}), "UNTAG Premium"] }) : null,
	description ? raw(description) : null
] }));
//#endregion
export { rootUrl as i, parseArticle as n, parseResult as r, apiRootUrl as t };
