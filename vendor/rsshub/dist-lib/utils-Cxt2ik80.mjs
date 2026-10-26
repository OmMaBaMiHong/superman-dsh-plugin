import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/visionias/templates/description.tsx
const Description = ({ heading, subItems, articleContent }) => /* @__PURE__ */ jsxs(Fragment, { children: [heading ? /* @__PURE__ */ jsx("h1", { children: heading }) : null, subItems ? /* @__PURE__ */ jsx(Fragment, { children: subItems.map((item, index) => item?.description ? /* @__PURE__ */ jsx("span", { children: raw(item.description) }, `sub-${index}`) : null) }) : /* @__PURE__ */ jsx(Fragment, { children: articleContent ? raw(articleContent) : null })] });
const renderDescription = (props) => renderToString(/* @__PURE__ */ jsx(Description, { ...props }));
//#endregion
//#region lib/routes/visionias/templates/description-sub.tsx
const DescriptionSub = ({ heading, articleContent }) => /* @__PURE__ */ jsxs(Fragment, { children: [heading ? /* @__PURE__ */ jsx("h2", { children: heading }) : null, articleContent ? raw(articleContent) : null] });
const renderDescriptionSub = (props) => renderToString(/* @__PURE__ */ jsx(DescriptionSub, { ...props }));
//#endregion
//#region lib/routes/visionias/utils.ts
const baseUrl = "https://visionias.in";
async function extractNews(item, selector) {
	if (item.link === "") return item;
	return await cache_default.tryGet(item.link, async () => {
		const $$ = load(await rofetch(item.link || ""));
		const postedDate = String($$("meta[property=\"article:published_time\"]").attr("content"));
		const updatedDate = String($$("meta[property=\"article:modified_time\"]").attr("content"));
		const tags = $$("meta[property=\"article:tag\"]").toArray().map((tag) => $$(tag).attr("content"));
		const content = $$(selector);
		const heading = content.find("div.space-y-4 > h1").text();
		const mainGroup = content.find("div.flex > div.w-full");
		const shortArticles = mainGroup.find("[x-data^=\"{isShortArticleOpen\"]");
		if (shortArticles.length !== 0) return shortArticles.toArray().map((element) => {
			const mainDiv = $$(element);
			const title = mainDiv.find("a > div > h2").text().trim();
			const id = mainDiv.find("a").attr("href");
			const htmlContent = extractArticle(mainDiv.html());
			const innerTags = mainDiv.find("ul > li:contains(\"Tags :\")")?.nextAll("li").toArray().map((tag) => $$(tag).text());
			const description = renderDescription({
				heading: title,
				articleContent: htmlContent
			});
			return {
				title: `${title} | ${heading}`,
				pubDate: parseDate(postedDate),
				category: innerTags,
				description,
				link: `${item.link}${id}`,
				author: "Vision IAS"
			};
		});
		const sections = mainGroup.find("[x-data^=\"{isSectionOpen\"]");
		if (sections.length === 0) {
			const description = renderDescription({
				heading,
				articleContent: extractArticle(mainGroup.html())
			});
			return {
				title: item.title,
				pubDate: parseDate(postedDate),
				category: tags,
				description,
				link: item.link,
				updated: updatedDate ? parseDate(updatedDate) : null,
				author: "Vision IAS"
			};
		}
		const description = renderDescription({
			heading,
			subItems: sections.toArray().map((element) => {
				const mainDiv = $$(element);
				return { description: renderDescriptionSub({
					heading: mainDiv.find("a > div > h2").text().trim(),
					articleContent: extractArticle(mainDiv.html(), "div.ck-content")
				}) };
			})
		});
		return {
			title: heading,
			pubDate: parseDate(postedDate),
			category: tags,
			description,
			link: item.link,
			updated: updatedDate ? parseDate(updatedDate) : null,
			author: "Vision IAS"
		};
	});
}
function extractArticle(articleDiv, selectorString = "div.ck-content") {
	const $ = load(articleDiv, null, false);
	const articleContent = $(articleDiv).find(selectorString);
	articleContent.find("figure").each((_, element) => {
		$(element).css("width", "");
	});
	return articleContent.html();
}
//#endregion
export { extractNews as n, baseUrl as t };
