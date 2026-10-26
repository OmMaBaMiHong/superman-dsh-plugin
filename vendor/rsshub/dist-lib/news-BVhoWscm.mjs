import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as PRESETS } from "./header-generator-DACPoxdp.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
import pMap from "p-map";
//#region lib/routes/wsj/utils.tsx
const parseArticle = (item) => cache_default.tryGet(item.link, async () => {
	const html = (await got_default({
		url: item.link.replace(/(?<=^https:\/\/\w+\.wsj\.com)/, "/amp"),
		method: "get",
		headerGeneratorOptions: PRESETS.MODERN_ANDROID
	})).data;
	const $ = load(html);
	const summary = $("head > meta[name=\"description\"]").attr("content");
	const updatedAt = $("meta[itemprop=\"dateModified\"]").attr("content");
	const publishedAt = $("meta[itemprop=\"datePublished\"]").attr("content");
	const author = $(".author > a[rel=\"author\"]").text();
	const categories = $("meta[name=\"keywords\"]").attr("content").split(",").map((c) => c.trim());
	const article = $("article");
	item.subTitle = $("h2.sub-head").html();
	article.find(".media-object-podcast").remove();
	article.find(".bylineWrap").each((i, e) => {
		$(e).find("p").each((_, el) => {
			$(el).replaceWith($(el).html());
		});
	});
	article.find(".bigTop-hero").each((i, e) => {
		const imgSrc = $(e).find("amp-img").attr("src");
		const imgAlt = $(e).find("amp-img").attr("alt");
		const figCaption = $(e).find(".imageCaption").text().trim();
		const figCredit = $(e).find(".imageCredit").text().trim();
		const fig = $(`<figure><img src="${imgSrc}" alt="${imgAlt}"><figcaption>${figCaption} <span>${figCredit}</span></figcaption></figure>`);
		$(fig).insertBefore(e);
		$(e).remove();
	});
	article.find("amp-img").each((i, e) => {
		const img = $(`<img width="${e.attribs.width}" height="${e.attribs.height}" src="${e.attribs.src}" alt="${e.attribs.alt}">`);
		$(img).insertBefore(e);
		$(e).remove();
	});
	article.find("amp-iframe").each((i, e) => {
		const iframe = $(`<iframe width="${e.attribs.width}" height="${e.attribs.height}" src="${e.attribs.src}">`);
		$(iframe).insertBefore(e);
		$(e).remove();
	});
	for (const selector of [
		"amp-ad",
		".wsj-ad",
		"h1",
		"h2",
		".zonedModule",
		".snippet",
		".newsletter-inset"
	]) article.find(selector).each((i, e) => {
		$(e).remove();
	});
	article.find(".paywall").each((i, e) => {
		$(e.childNodes).insertBefore(e);
		$(e).remove();
	});
	item.article = article.html();
	item.description = renderToString(/* @__PURE__ */ jsx(WsjDescription, {
		subTitle: item.subTitle,
		article: item.article
	}));
	return {
		title: item.title,
		pubDate: parseDate(publishedAt),
		updated: parseDate(updatedAt),
		author,
		link: item.link,
		summary,
		description: item.description,
		category: categories,
		icon: "https://s.wsj.net/media/wsj_launcher-icon-4x.png",
		logo: "https://vir.wsj.net/fp/assets/webpack4/img/wsj-logo-big-black.165e51cc.svg"
	};
});
const WsjDescription = ({ subTitle, article }) => /* @__PURE__ */ jsxs("div", { children: [subTitle ? raw(subTitle) : null, article ? raw(article) : null] });
//#endregion
//#region lib/routes/wsj/news.ts
const hostMap = {
	"en-us": "https://www.wsj.com",
	"zh-cn": "https://cn.wsj.com/zh-hans",
	"zh-tw": "https://cn.wsj.com/zh-hant"
};
const route = {
	path: "/:lang/:category?",
	categories: ["traditional-media"],
	example: "/wsj/en-us/opinion",
	parameters: {
		lang: "Language, `en-us`, `zh-cn`, `zh-tw`",
		category: "Category. See below"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "News",
	maintainers: ["oppilate"],
	handler,
	description: `en\\_us

| World | U.S. | Politics | Economy | Business | Tech       | Markets | Opinion | Books & Arts | Real Estate | Life & Work | Sytle               | Sports |
| ----- | ---- | -------- | ------- | -------- | ---------- | ------- | ------- | ------------ | ----------- | ----------- | ------------------- | ------ |
| world | us   | politics | economy | business | technology | markets | opinion | books-arts   | realestate  | life-work   | style-entertainment | sports |

zh-cn / zh-tw

| 国际  | 中国  | 金融市场 | 经济    | 商业     | 科技       | 派        | 专栏与观点 |
| ----- | ----- | -------- | ------- | -------- | ---------- | --------- | ---------- |
| world | china | markets  | economy | business | technology | life-arts | opinion    |

Provide full article RSS for WSJ topics.`
};
async function handler(ctx) {
	const lang = ctx.req.param("lang");
	const category = ctx.req.param("category") || "";
	const host = hostMap[lang];
	let subtitle = ` - ${lang.toUpperCase()}`;
	let url = host;
	if (category.length > 0) {
		url = `${host}/news/${category}`;
		subtitle += ` - ${category}`;
	}
	const contents = load((await got_default({
		method: "get",
		url
	})).data)("script:contains(\"window.__STATE__\")").text();
	const data = JSON.parse(contents.match(/\{.*\}/)[0]).data;
	const items = await pMap(Object.entries(data).filter(([key, value]) => {
		if (!key.startsWith("article")) return false;
		return value.data.data.url.includes("wsj.com/articles/");
	}).map(([key]) => key).map((key) => {
		return {
			title: data[key].data.data.headline,
			link: data[key].data.data.url,
			test: key
		};
	}), (item) => parseArticle(item), { concurrency: 10 });
	return {
		title: `WSJ${subtitle}`,
		link: url,
		description: `WSJ${subtitle}`,
		item: items
	};
}
//#endregion
export { route };
