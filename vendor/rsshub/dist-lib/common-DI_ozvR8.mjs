import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { r as getSubPath } from "./common-utils-xJr7JYuG.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/nber/common.tsx
async function getData(url) {
	return (await rofetch(url)).results;
}
async function handler(ctx) {
	const url = "https://www.nber.org/api/v1/working_page_listing/contentType/working_paper/_/_/search";
	const baseUrl = "https://www.nber.org";
	const data = await cache_default.tryGet(url, () => getData(url), config.cache.routeExpire, false);
	return {
		title: "NBER Working Paper",
		link: "https://www.nber.org/papers",
		item: await Promise.all(data.filter((article) => getSubPath(ctx) === "/papers" || article.newthisweek).map((article) => {
			const link = `${baseUrl}${article.url}`;
			return cache_default.tryGet(link, async () => {
				const $ = load(await rofetch(link));
				const downloadLink = $("meta[name=\"citation_pdf_url\"]").attr("content");
				const fullAbstract = $(".page-header__intro-inner").html();
				return {
					title: article.title,
					author: $("meta[name=\"dcterms.creator\"]").attr("content"),
					pubDate: parseDate($("meta[name=\"citation_publication_date\"]").attr("content"), "YYYY/MM/DD"),
					link,
					doi: $("meta[name=\"citation_doi\"]").attr("content"),
					description: renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [fullAbstract ? raw(fullAbstract) : null, downloadLink ? /* @__PURE__ */ jsx("a", {
						href: downloadLink,
						children: "Download PDF"
					}) : null] }))
				};
			});
		})),
		description: "National Bureau of Economic Research Working Papers articles"
	};
}
//#endregion
export { handler as t };
