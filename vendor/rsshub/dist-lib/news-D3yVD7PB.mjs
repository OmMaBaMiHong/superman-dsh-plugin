import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as parser } from "./rss-parser-lNYr71DQ.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/onet/templates/image.tsx
const ImageFigure = ({ url, alt, caption, author }) => /* @__PURE__ */ jsxs("figure", { children: [/* @__PURE__ */ jsx("img", {
	src: url,
	alt
}), /* @__PURE__ */ jsxs("figcation", { children: [caption ? /* @__PURE__ */ jsxs(Fragment, { children: [
	/* @__PURE__ */ jsx("cite", { children: caption }),
	" -",
	" "
] }) : null, author] })] });
const renderImage = (props) => renderToString(/* @__PURE__ */ jsx(ImageFigure, { ...props }));
//#endregion
//#region lib/routes/onet/utils.ts
const parseMainImage = ($) => {
	const mainImage = $("figure.mainPhoto");
	const img = mainImage.find("img");
	const author = mainImage.find("span.copyright");
	const caption = mainImage.find("span.imageDescription");
	return renderImage({
		url: img.attr("src"),
		alt: img.attr("alt")?.trim(),
		author: author.text()?.trim(),
		caption: caption.text()?.trim()
	});
};
const parseArticleContent = ($) => {
	const content = $("[itemprop=\"articleBody\"]");
	$("*").contents().filter((_, el) => el.nodeType === 8).remove();
	content.find("aside").remove();
	content.find(".videoPlayerContainer").remove();
	content.find(".pulsevideo").remove();
	content.find(".adsContainer").remove();
	content.find(".placeholder").remove();
	content.find(".contentPremium").removeAttr("style");
	content.find("div.image").each((i, el) => {
		const img = $(el).find("img");
		const author = $(el).find("span.author");
		const caption = $(el).find("span.caption");
		const html = renderImage({
			url: img.attr("src"),
			alt: img.attr("alt")?.trim(),
			caption: caption.text()?.trim(),
			author: author.text()?.trim()
		});
		$(el).replaceWith(html);
	});
	return content;
};
//#endregion
//#region lib/routes/onet/news.tsx
const route = {
	path: "/news",
	categories: ["new-media"],
	example: "/onet/news",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["wiadomosci.onet.pl/"] }],
	name: "News",
	maintainers: ["Vegann"],
	handler,
	url: "wiadomosci.onet.pl/",
	description: "This route provides a better reading experience (full text articles) over the official one for `https://wiadomosci.onet.pl`."
};
async function handler() {
	const feed = await parser.parseURL("https://wiadomosci.onet.pl/.feed");
	const items = await Promise.all(feed.items.map(async (item) => {
		const { description, author, category } = await cache_default.tryGet(item.link, async () => {
			const { data: response } = await got_default(item.link, { headers: { referer: "https://www.onet.pl/" } });
			const $ = load(response);
			const content = parseArticleContent($);
			const mainImage = parseMainImage($);
			return {
				description: renderDescription($("#lead").text()?.trim(), mainImage, content.html()?.trim()),
				author: $(".authorNameWrapper span[itemprop=\"name\"]").text()?.trim(),
				category: $("span.relatedTopic").text()?.trim()
			};
		});
		return {
			title: item.title,
			link: item.link,
			description,
			author,
			category,
			pubDate: parseDate(item.pubDate),
			guid: item.id
		};
	}));
	return {
		title: feed.title,
		link: feed.link,
		description: feed.title,
		item: items,
		language: "pl",
		image: "https://ocdn.eu/wiadomosciucs/static/logo2017/onet2017big_dark.png"
	};
}
const renderDescription = (lead, mainImage, content) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	lead ? /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("strong", { children: lead }) }) : null,
	raw(mainImage),
	content ? raw(content) : null
] }));
//#endregion
export { route };
