import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/app-sales/util.tsx
const baseUrl = "https://www.app-sales.net";
const renderDescription = ({ images, appName, appDev, appNote, rating, downloads, bookmarks, priceNew, priceOld, priceDisco, linkUrl }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [images?.map((image) => image?.src ? /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", {
	src: image.src,
	alt: image.alt
}) }) : null), appName ? /* @__PURE__ */ jsx("table", { children: /* @__PURE__ */ jsxs("tbody", { children: [
	/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "Name" }), /* @__PURE__ */ jsx("td", { children: appName })] }),
	appDev ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "Developer" }), /* @__PURE__ */ jsx("td", { children: appDev })] }) : null,
	appNote ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "Note" }), /* @__PURE__ */ jsx("td", { children: appNote })] }) : null,
	rating ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "Rating" }), /* @__PURE__ */ jsx("td", { children: rating })] }) : null,
	downloads ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "Downloads" }), /* @__PURE__ */ jsx("td", { children: downloads })] }) : null,
	bookmarks ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "Bookmarks" }), /* @__PURE__ */ jsx("td", { children: bookmarks })] }) : null,
	priceNew ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "Price" }), /* @__PURE__ */ jsxs("td", { children: [
		/* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx("strong", { children: priceNew }) }),
		priceOld ? /* @__PURE__ */ jsx("span", {
			style: "color: grey;",
			children: /* @__PURE__ */ jsx("small", { children: /* @__PURE__ */ jsx("del", { children: priceOld }) })
		}) : null,
		priceDisco ? /* @__PURE__ */ jsx("span", {
			style: "color: white; background-color: #54ae45;",
			children: /* @__PURE__ */ jsx("strong", { children: priceDisco })
		}) : null
	] })] }) : null,
	linkUrl ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "Link" }), /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("a", {
		href: linkUrl,
		target: "_blank",
		children: linkUrl
	}) })] }) : null
] }) }) : null] }));
/**
* Formats price change information into a standardized tag
* @param priceOld - Old price
* @param priceNew - New price
* @param priceDisco - Discount
* @returns Formatted price change tag string. Returns empty string when no new price exists.
*/
const formatPriceChangeTag = (priceOld, priceNew, priceDisco) => priceNew?.trim() ? `[${[
	priceOld && `${priceOld}→`,
	priceNew,
	priceDisco && ` ${priceDisco}`
].filter(Boolean).join("")}]` : "";
/**
* Processes DOM elements into structured data items
* @param $ - CheerioAPI instance
* @param selector - CSS selector for target elements
* @returns Parsed data items array.
*/
const processItems = ($, selector) => $(selector).toArray().map((el) => {
	const $el = $(el);
	const appName = $el.find("p.app-name").text()?.trim();
	const appDev = $el.find("p.app-dev").text()?.trim();
	const appNote = $el.find("p.app-dev").next("p")?.text()?.trim() ?? "";
	const rating = $el.find("p.rating").contents().last().text()?.trim();
	const downloads = $el.find("p.downloads").contents().last().text()?.trim();
	const bookmarks = $el.find("p.bookmarks").contents().last().text()?.trim();
	const priceNew = $el.find("div.price-new").text()?.trim();
	const priceOld = $el.find("div.price-old").text()?.trim();
	const priceDisco = $el.find("div.price-disco").text()?.trim();
	const isHot = $el.hasClass("sale-hot");
	const isFree = priceNew?.toLocaleUpperCase() === "FREE";
	const title = `${appName} ${formatPriceChangeTag(priceOld, priceNew, priceDisco)}`;
	const image = $el.find("div.app-icon img").attr("src");
	const linkUrl = $el.find("div.sale-list-action a").attr("href");
	const description = renderDescription({
		images: image ? [{
			alt: `${appName}-${appDev}`,
			src: image
		}] : void 0,
		appName,
		appDev,
		appNote,
		rating,
		downloads,
		bookmarks,
		priceNew,
		priceOld,
		priceDisco,
		linkUrl
	});
	const categories = [isHot ? "Hot" : void 0, isFree ? "Free" : void 0].filter(Boolean);
	const authors = appDev;
	const guid = [
		appName,
		appDev,
		rating,
		downloads,
		bookmarks,
		priceNew
	].filter(Boolean).join("-");
	return {
		title: title.trim(),
		description,
		link: linkUrl,
		category: categories,
		author: authors,
		guid,
		id: guid,
		content: {
			html: description,
			text: description
		},
		image,
		banner: image
	};
});
/**
* Retrieves pagination URLs from page navigation
* @param $ - CheerioAPI instance
* @param targetUrl - Base URL for relative path resolution
* @returns Array of absolute pagination URLs.
*/
const getAvailablePageUrls = ($, targetUrl) => $("ul.pagination li.waves-effect a").slice(0, -1).toArray().filter((el) => {
	return $(el).attr("href");
}).map((el) => {
	const $el = $(el);
	return new URL($el.attr("href"), targetUrl).href;
});
/**
* Aggregates items across paginated pages
* @param $ - Initial page CheerioAPI instance
* @param selector - Target element CSS selector
* @param targetUrl - Base URL for pagination requests
* @param country - Country ID for request headers
* @param limit - Maximum number of items to return
* @returns Aggregated items array within specified limit.
*/
const fetchItems = async ($, selector, targetUrl, country, limit) => {
	const initialItems = processItems($, selector);
	if (initialItems.length >= limit) return initialItems.slice(0, limit);
	/**
	* Recursive helper function to process paginated URLs
	*
	* @param remainingUrls - Array of URLs yet to be processed
	* @param aggregated - Accumulator for collected items
	*
	* @returns Promise resolving to aggregated items
	*/
	const processPage = async (remainingUrls, aggregated) => {
		if (aggregated.length >= limit || remainingUrls.length === 0) return aggregated.slice(0, limit);
		const [currentUrl, ...restUrls] = remainingUrls;
		try {
			const response = await rofetch(currentUrl, { headers: { Cookie: `countryId=${country};` } });
			const pageItems = processItems(load(response), selector);
			const newItems = [...aggregated, ...pageItems];
			return newItems.length >= limit ? newItems.slice(0, limit) : processPage(restUrls, newItems);
		} catch {
			return processPage(restUrls, aggregated);
		}
	};
	return await processPage(getAvailablePageUrls($, targetUrl), initialItems);
};
//#endregion
export { fetchItems as n, baseUrl as t };
