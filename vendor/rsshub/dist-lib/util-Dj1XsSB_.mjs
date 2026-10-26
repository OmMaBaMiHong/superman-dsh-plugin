import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import "rfc4648";
//#region lib/routes/zaobao/zaobao.tsx
function zaobao({ imageDataArray, articleBody }) {
	return /* @__PURE__ */ jsxs(Fragment, { children: [imageDataArray.map((imageData) => imageData.type === "normalHTML" ? /* @__PURE__ */ jsx("div", { dangerouslySetInnerHTML: { __html: imageData.html } }) : imageData.type === "data" && /* @__PURE__ */ jsxs("figure", { children: [/* @__PURE__ */ jsx("img", { src: imageData.src }), /* @__PURE__ */ jsx("figcaption", { children: imageData.title })] })), articleBody && /* @__PURE__ */ jsx("div", { dangerouslySetInnerHTML: { __html: articleBody } })] });
}
//#endregion
//#region lib/routes/zaobao/util.tsx
const baseUrl = "https://www.zaobao.com";
const logo = "https://www.zaobao.com.sg/favicon.ico";
/**
* 通用解析页面类似 https://www.zaobao.com/realtime/china 的网站
*
* @param {string} sectionUrl 形如 /realtime/china 的字符串
* @returns 新闻标题以及新闻列表
*/
const parseList = async (sectionUrl) => {
	const pageResponse = await rofetch.raw(baseUrl + sectionUrl);
	const $ = load(pageResponse._data);
	let data = $(".card-listing .card .content-header a");
	if (data.length === 0) data = $("[data-testid=\"article-list\"] article div div a.article-link");
	const origin = new URL(pageResponse.url).origin;
	return {
		title: $("meta[property=\"og:title\"]").attr("content"),
		resultList: await Promise.all(data.toArray().map((item) => {
			const $item = $(item);
			const link = baseUrl + $item.attr("href");
			return cache_default.tryGet(link, async () => {
				if ($item.attr("href")?.includes("https://")) return {
					title: pageResponse.url.startsWith("https://www.zaobao.com.sg/") ? $item.text().trim() : $item.attr("title")?.trim(),
					link: $item.attr("href"),
					pubDate: timezone($item.next().text().trim().includes(":") ? parseDate($item.next().text().trim(), "HH:mm") : parseDate($item.next().text().trim(), "MM月DD日"), 8)
				};
				const response = await rofetch.raw(new URL($item.attr("href"), origin).href);
				let $1 = load(response._data);
				let title, pubDate, category, images;
				const jsonText = $1("script[type=\"application/ld+json\"]").text().replaceAll(/\p{Cc}/gu, "");
				const ldJson = JSON.parse(jsonText);
				const isSingapore = response.url.startsWith("https://www.zaobao.com.sg/");
				if (isSingapore) {
					const article = JSON.parse($1("#seo-article-page").text())["@graph"].find((item) => item["@type"] === "NewsArticle");
					title = article.headline;
					pubDate = parseDate(article.datePublished);
					category = $1("meta[name=\"keywords\"]").attr("content")?.split(",").map((s) => s.trim());
					$1 = load($1(".articleBody").html(), null, false);
					images = [{ url: article.image.url }];
				} else {
					title = ldJson.headline;
					pubDate = parseDate(ldJson.datePublished);
					category = ldJson.keywords?.split(",");
				}
				$1(".bff-google-ad, .bff-recommend-article").remove();
				$1("button.cursor-pointer").remove();
				$1(".bff-inline-image-expand-icon").remove();
				$1("img[alt=\"expend icon\"]").remove();
				let articleBodyNode;
				if (isSingapore) articleBodyNode = $1;
				else {
					$1("astro-island, .further-reading, .read-on-app-cover").remove();
					articleBodyNode = $1(".article-body");
				}
				const articleBody = articleBodyNode.html();
				const description = renderToString(/* @__PURE__ */ jsx(zaobao, {
					imageDataArray: processImageData(isSingapore, images, $1),
					articleBody
				}));
				return {
					title,
					description,
					pubDate,
					link,
					category
				};
			});
		}))
	};
};
const processImageData = (isSg, images, $1) => {
	if (isSg && images) return images.map((img) => ({
		type: "data",
		html: "",
		src: img.url.replaceAll(/\/\/.*\.com\/s3fs-public/g, "//static.zaobao.com/s3fs-public").replaceAll("s3/files", "s3fs-public").split("?", 1)[0],
		title: img.caption
	}));
	const hkImg = $1("[data-testid=\"article-banner\"] img");
	if (hkImg.length) return [{
		type: "data",
		html: hkImg.prop("outerHTML"),
		src: hkImg.attr("src").replaceAll(/\/\/.*\.com\/s3fs-public/g, "//static.zaobao.com/s3fs-public").replaceAll("s3/files", "s3fs-public").split("?", 1)[0],
		title: hkImg.attr("title")
	}];
	return [];
};
//#endregion
export { parseList as n, logo as t };
