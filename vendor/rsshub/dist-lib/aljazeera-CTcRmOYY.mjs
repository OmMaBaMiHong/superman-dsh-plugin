import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { r as getSubPath } from "./common-utils-xJr7JYuG.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/aljazeera/index.tsx
const languages = {
	arabic: {
		rootUrl: "https://www.aljazeera.net",
		rssUrl: "rss"
	},
	chinese: {
		rootUrl: "https://chinese.aljazeera.net",
		rssUrl: void 0
	},
	english: {
		rootUrl: "https://www.aljazeera.com",
		rssUrl: "xml/rss/all.xml"
	}
};
const renderDescription = (image, description) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [image ? /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx(Fragment, { children: raw(image) }) }) : null, description ? /* @__PURE__ */ jsx(Fragment, { children: raw(description) }) : null] }));
const route = {
	path: "*",
	name: "Unknown",
	maintainers: ["nczitzk"],
	handler
};
async function handler(ctx) {
	const params = getSubPath(ctx) === "/" ? ["arabic"] : getSubPath(ctx).replace(/^\//, "").split("/");
	if (!Object.hasOwn(languages, params[0])) params.unshift("arabic");
	const language = params.shift();
	const isRSS = params.length === 1 && params.at(-1) === "rss" && languages[language].rssUrl;
	const rootUrl = languages[language].rootUrl;
	const currentUrl = `${rootUrl}/${isRSS ? languages[language].rssUrl : params.join("/")}`;
	const response = await rofetch(currentUrl);
	const $ = load(response);
	let items = isRSS ? response.data.match(new RegExp("<link>" + rootUrl + "/(.*?)</link>", "g")).map((item) => ({ link: item.match(/<link>(.*?)<\/link>/)[1] })) : $(".u-clickable-card__link").toArray().map((item) => {
		item = $(item);
		return { link: `${rootUrl}${item.attr("href")}` };
	});
	const limit = ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 50;
	items = await Promise.all(items.slice(0, limit).map((item) => cache_default.tryGet(item.link, async () => {
		const detailResponse = await rofetch(item.link);
		const content = load(detailResponse);
		content(".more-on").parent().remove();
		content(".responsive-image img").removeAttr("srcset");
		let pubDate;
		const datePublished = detailResponse.match(/"datePublished": ?"(.*?)",/);
		if (datePublished && datePublished.length > 1) pubDate = detailResponse.match(/"datePublished": ?"(.*?)",/)[1];
		else {
			const uploadDate = detailResponse.match(/"uploadDate": ?"(.*?)",/)[1];
			pubDate = uploadDate && uploadDate.length > 1 ? uploadDate : content("div.date-simple > span:nth-child(2)").text();
		}
		item.title = content("h1").first().text();
		item.author = content(".author").text();
		item.pubDate = pubDate;
		item.description = renderDescription(content(".article-featured-image").html(), content(".wysiwyg").html());
		return item;
	})));
	return {
		title: $("title").first().text(),
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
