import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/pubmed/trending.tsx
const route = {
	path: "/trending/:filters?",
	name: "Unknown",
	maintainers: ["nczitzk"],
	handler
};
async function handler(ctx) {
	const filters = ctx.req.param("filters");
	const rootUrl = "https://pubmed.ncbi.nlm.nih.gov";
	const currentUrl = `${rootUrl}/trending${filters ? `?filter=${filters.replaceAll(",", "&filter=")}` : ""}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	let items = $("a[data-article-id]").toArray().map((item) => {
		item = $(item);
		return {
			title: item.text(),
			link: `${rootUrl}/${item.attr("data-article-id")}`
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		item.doi = content("meta[name=\"citation_doi\"]").attr("content");
		item.pubDate = parseDate(content("meta[name=\"citation_date\"]").attr("content"));
		item.description = renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
			content(".authors-list").html() ? raw(content(".authors-list").html()) : null,
			/* @__PURE__ */ jsx("br", {}),
			content("#enc-abstract").html() ? raw(content("#enc-abstract").html()) : null
		] }));
		return item;
	})));
	return {
		title: "Trending page - PubMed",
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
