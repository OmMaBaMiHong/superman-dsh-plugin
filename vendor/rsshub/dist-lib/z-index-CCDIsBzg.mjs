import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { r as getSubPath } from "./common-utils-xJr7JYuG.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import dayjs from "dayjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/dlsite/templates/description.tsx
const formatDate = (date) => date ? dayjs(date).format("YYYY-MM-DD HH:mm") : "";
const renderDescription = ({ detail, images, authors, discountRate, discountEndDate, updatedDate, pubDate, workCategories, searchTags, description }) => {
	const localePrices = detail.locale_price_str ?? {};
	const localeOfficialPrices = detail.locale_official_price_str ?? {};
	const hasOfficialPrice = Boolean(detail.official_price_str);
	const hasLocaleOfficialPrices = Boolean(detail.locale_official_price_str);
	const price = detail.price_str;
	return renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("table", { children: /* @__PURE__ */ jsxs("tbody", { children: [
		discountRate ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "割引" }), /* @__PURE__ */ jsxs("td", { children: [discountRate, "%"] })] }) : null,
		discountEndDate ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "割引終了時間" }), /* @__PURE__ */ jsx("td", { children: formatDate(discountEndDate) })] }) : null,
		price ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "価格\xA0(JPY)" }), /* @__PURE__ */ jsxs("td", { children: [
			raw(price),
			/* @__PURE__ */ jsx("i", { children: "\xA0円" }),
			"\xA0\xA0",
			hasOfficialPrice ? /* @__PURE__ */ jsx("del", { children: /* @__PURE__ */ jsxs("small", { children: [raw(detail.official_price_str), /* @__PURE__ */ jsx("i", { children: "\xA0円" })] }) }) : null
		] })] }) : null,
		localePrices.en_US ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "価格\xA0(USD)" }), /* @__PURE__ */ jsxs("td", { children: [raw(localePrices.en_US), hasLocaleOfficialPrices ? /* @__PURE__ */ jsx("del", { children: /* @__PURE__ */ jsx("small", { children: raw(localeOfficialPrices.en_US) }) }) : null] })] }) : null,
		localePrices.ko_KR ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "価格\xA0(KRW)" }), /* @__PURE__ */ jsxs("td", { children: [raw(localePrices.ko_KR), hasLocaleOfficialPrices ? /* @__PURE__ */ jsx("del", { children: /* @__PURE__ */ jsx("small", { children: raw(localeOfficialPrices.ko_KR) }) }) : null] })] }) : null,
		localePrices.zh_CN ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "価格\xA0(RMB)" }), /* @__PURE__ */ jsxs("td", { children: [raw(localePrices.zh_CN), hasLocaleOfficialPrices ? /* @__PURE__ */ jsx("del", { children: /* @__PURE__ */ jsx("small", { children: raw(localeOfficialPrices.zh_CN) }) }) : null] })] }) : null,
		localePrices.zh_TW ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "価格\xA0(TWD)" }), /* @__PURE__ */ jsxs("td", { children: [raw(localePrices.zh_TW), hasLocaleOfficialPrices ? /* @__PURE__ */ jsx("del", { children: /* @__PURE__ */ jsx("small", { children: raw(localeOfficialPrices.zh_TW) }) }) : null] })] }) : null,
		detail.default_point_str ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "ポイント" }), /* @__PURE__ */ jsxs("td", { children: [detail.default_point_str, "\xA0pt"] })] }) : null,
		authors?.length ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "作者" }), /* @__PURE__ */ jsx("td", { children: authors.map((author) => /* @__PURE__ */ jsx("a", {
			href: author.link,
			children: author.name
		})) })] }) : null,
		updatedDate ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "発売日" }), /* @__PURE__ */ jsx("td", { children: formatDate(updatedDate) })] }) : null,
		pubDate ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "販売日" }), /* @__PURE__ */ jsx("td", { children: formatDate(pubDate) })] }) : null,
		workCategories?.length ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "作品形式" }), /* @__PURE__ */ jsx("td", { children: workCategories.map((category) => /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("a", {
			href: category.link,
			children: category.text
		}), ",\xA0"] })) })] }) : null,
		searchTags?.length ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "ジャンル" }), /* @__PURE__ */ jsx("td", { children: searchTags.map((tag) => /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("a", {
			href: tag.link,
			children: tag.text
		}), ",\xA0"] })) })] }) : null,
		description ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "概要" }), /* @__PURE__ */ jsx("td", { children: description })] }) : null
	] }) }), images?.length ? images.map((image) => /* @__PURE__ */ jsx("img", { src: image })) : null] }));
};
//#endregion
//#region lib/routes/dlsite/utils.ts
const rootUrl = "https://www.dlsite.com";
const defaultFilters = {
	show_type: 1,
	show_layout: 1,
	per_page: 100
};
const addFilters = (url, filters) => {
	const keys = Object.keys(filters);
	const filterStr = keys.map((k) => `/${k}/${filters[k]}`).join("");
	const newUrl = url.replaceAll(new RegExp(String.raw`(/${keys.join(String.raw`/\w+|/`)}/\w+)`, "g"), "");
	return `${newUrl}${/=/.test(newUrl) ? "" : "/="}${filterStr}`;
};
const getPubDate = (raw) => {
	const dateMatches = raw.match(/(\d{4}).*(\d{2}).*(\d{2})/);
	if (dateMatches) return parseDate(`${dateMatches[1]}-${dateMatches[2]}-${dateMatches[3]}`, "YYYY-MM-DD");
	return parseDate(raw.split(":").pop().trim(), "MMM/DD/YYYY");
};
const getDetails = async (works) => {
	return (await got_default({
		method: "get",
		url: `${rootUrl}/home-touch/product/info/ajax?product_id=${works}`
	})).data;
};
const ProcessItems = async (ctx) => {
	const subPath = getSubPath(ctx) === "/" ? "/home/new" : getSubPath(ctx);
	const limit = ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 100;
	const currentUrl = `${rootUrl}${addFilters(subPath, defaultFilters)}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	const works = $("dt.work_name").slice(0, limit);
	const updatedDate = $(".work_update").length === 0 ? void 0 : getPubDate($(".work_update").text());
	const details = await getDetails(works.toArray().map((item) => $(item).find("a").attr("href").match(/_id\/(.*?)\.html/)[1]).join(","));
	const items = works.toArray().map((item) => {
		item = $(item).parentsUntil("tbody, ul");
		const a = item.find(".work_name a");
		const title = a.text();
		const link = a.attr("href");
		const guid = link.match(/_id\/(.*?)\.html/)[1];
		const description = item.find(".work_text").text();
		const authors = item.find(".maker_name a").toArray().map((a) => ({
			name: $(a).text(),
			link: $(a).attr("href")
		}));
		let images = item.find("div[data-samples]").length === 0 ? [] : JSON.parse(item.find("div[data-samples]").attr("data-samples").replaceAll("'", "\"")).map((s) => s.thumb);
		const workCategories = item.find(".work_category").find("a").toArray().map((i) => ({
			text: $(i).text(),
			link: $(i).attr("href")
		}));
		const workGenres = item.find(".work_genre").find("span[title]").toArray().map((i) => ({ text: $(i).text() }));
		const searchTags = item.find(".search_tag").find("a").toArray().map((i) => ({
			text: $(i).text(),
			link: $(i).attr("href")
		}));
		const nameTags = item.find(".icon_wrap").find("span[title]").toArray().map((i) => ({ text: $(i).text() }));
		const detail = details[guid];
		const pubDate = timezone(parseDate(detail.regist_date), 9);
		const discountRate = detail.discount_rate;
		const discountEndDate = detail.discount_end_date ? timezone(parseDate(detail.discount_end_date, "MM/DD HH:mm"), 9) : void 0;
		images = images.length === 0 ? [detail.work_image] : images;
		return {
			title: `${discountRate ? `${discountRate}% OFF ${discountEndDate ? `${dayjs(discountEndDate).format("YYYY-MM-DD HH:mm")} まで` : ""}` : " "}${title}`,
			link,
			pubDate,
			author: authors.map((a) => a.name).join(" / "),
			category: [
				...workCategories.map((i) => i.text),
				...workGenres.map((i) => i.text),
				...searchTags.map((i) => i.text),
				...nameTags.map((i) => i.text)
			],
			guid: `dlsite-${guid}`,
			description: renderDescription({
				detail,
				images,
				authors,
				discountRate,
				discountEndDate,
				updatedDate,
				pubDate,
				workCategories,
				searchTags,
				description
			})
		};
	});
	return {
		title: $("title").text(),
		description: $("meta[name=\"description\"]").attr("content"),
		link: currentUrl,
		item: items,
		allowEmpty: true
	};
};
//#endregion
//#region lib/routes/dlsite/z-index/index.ts
const route = {
	path: "*",
	name: "Unknown",
	maintainers: [],
	handler,
	features: { nsfw: true }
};
async function handler(ctx) {
	return await ProcessItems(ctx);
}
//#endregion
export { route };
