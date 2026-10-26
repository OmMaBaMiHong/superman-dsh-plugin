import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import iconv from "iconv-lite";
//#region lib/routes/56kog/util.tsx
const rootUrl = "https://www.56kog.com";
const fetchItems = async (limit, currentUrl) => {
	const { data: response } = await got_default(currentUrl, { responseType: "buffer" });
	const $ = load(iconv.decode(response, "gbk"));
	let items = $("p.line").toArray().map((item) => {
		item = $(item);
		const a = item.find("a");
		return {
			title: a.text(),
			link: new URL(a.prop("href"), rootUrl).href,
			author: item.find("span").last().text()
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		try {
			const { data: detailResponse } = await got_default(item.link, { responseType: "buffer" });
			const content = load(iconv.decode(detailResponse, "gbk"));
			const details = content("div.mohe-content p").toArray().map((detail) => {
				detail = content(detail);
				const as = detail.find("a");
				return {
					label: detail.find("span.c-l-depths").text().split(/：/, 1)[0],
					value: as.length === 0 ? content(detail.contents().toArray().find((c) => c.nodeType === 3)).text().trim() : {
						href: new URL(as.first().prop("href"), rootUrl).href,
						text: as.first().text().trim()
					}
				};
			});
			const pubDate = details.find((detail) => detail.label === "更新").value;
			item.title = content("h1").contents().first().text();
			item.description = renderDescription({
				images: [{
					src: new URL(content("a.mohe-imgs img").prop("src"), rootUrl).href,
					alt: item.title
				}],
				details
			});
			item.author = details.find((detail) => detail.label === "作者").value;
			item.category = [details.find((detail) => detail.label === "状态").value, details.find((detail) => detail.label === "类型").value.text].filter(Boolean);
			item.guid = `56kog-${item.link.match(/\/(\d+)\.html$/)[1]}#${pubDate}`;
			item.pubDate = timezone(parseDate(pubDate), 8);
		} catch {}
		return item;
	})));
	const icon = new URL("favicon.ico", rootUrl).href;
	return {
		item: items.filter((item) => item.description).slice(0, limit),
		title: $("title").text(),
		link: currentUrl,
		description: $("meta[name=\"description\"]").prop("content"),
		language: $("html").prop("lang"),
		icon,
		logo: icon,
		subtitle: $("meta[name=\"keywords\"]").prop("content"),
		author: $("div.uni_footer a").text(),
		allowEmpty: true
	};
};
const renderDescription = ({ images, details }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [images?.map((image, index) => image?.src ? /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", {
	src: image.src,
	alt: image.alt
}) }, `${image.src}-${index}`) : null), details ? /* @__PURE__ */ jsx("table", { children: /* @__PURE__ */ jsx("tbody", { children: details.map((detail, index) => /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: detail.label }), /* @__PURE__ */ jsx("td", { children: detail.value?.href && detail.value.text ? /* @__PURE__ */ jsx("a", {
	href: detail.value.href,
	children: detail.value.text
}) : detail.value })] }, `${detail.label}-${index}`)) }) }) : null] }));
//#endregion
export { rootUrl as n, fetchItems as t };
