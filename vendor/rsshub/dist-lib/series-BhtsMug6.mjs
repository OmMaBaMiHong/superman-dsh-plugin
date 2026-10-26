import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import * as cheerio from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/yenpress/series.tsx
const render = (data) => renderToString(/* @__PURE__ */ jsx(SeriesDescription, { ...data }));
const route = {
	path: "/series/:name",
	example: "/yenpress/series/alya-sometimes-hides-her-feelings-in-russian",
	parameters: { name: "Series name" },
	name: "Series",
	maintainers: ["TonyRL"],
	handler,
	radar: [{
		source: ["yenpress.com/series/:name"],
		target: "/series/:name"
	}]
};
async function handler(ctx) {
	const { name: series } = ctx.req.param();
	const baseUrl = "https://yenpress.com";
	const link = `https://yenpress.com/series/${series}`;
	const response = await rofetch(link);
	const $ = cheerio.load(response);
	const list = $(".show-more-container .inline_block").toArray().map((item) => {
		const $item = $(item);
		return {
			title: $item.find("span").text().trim(),
			link: new URL($item.find("a").attr("href"), baseUrl).href
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const response = await rofetch(item.link);
		const $ = cheerio.load(response);
		item.category = $(".detail-labels.mobile-only").eq(0).find("a").toArray().map((a) => $(a).text().trim());
		$("svg, .social-share, .desktop-only, .detail-labels").remove();
		const cover = $(".book-info").find(".book-cover-img").html();
		const bookInfo = $(".buy-info .deliver").toArray().map((item, i) => ({
			deliver: $(item).text().trim(),
			price: $(".book-price").eq(i).text().trim(),
			from: $(".services").eq(i).find(".service").toArray().map((service) => {
				const a = $(service).find("a");
				return {
					name: a.text().trim(),
					link: a.attr("href")
				};
			}),
			detail: $(".detail-info").eq(i).find("div span").toArray().map((span) => {
				const $span = $(span);
				return {
					key: $span.text().trim(),
					value: $span.next().text().trim()
				};
			})
		}));
		const info = $(".book-info");
		info.find(".buy-info, .series-cover").remove();
		item.description = render({
			cover: cover + info.html(),
			bookInfo
		});
		item.pubDate = timezone(parseDate(bookInfo[0].detail.find((d) => d.key === "Release Date").value), 0);
		return item;
	})));
	return {
		title: $("head title").text().trim(),
		description: $(".social-share p").text().trim(),
		link,
		item: items
	};
}
const SeriesDescription = ({ cover, bookInfo }) => /* @__PURE__ */ jsxs(Fragment, { children: [cover ? /* @__PURE__ */ jsxs(Fragment, { children: [raw(cover), /* @__PURE__ */ jsx("br", {})] }) : null, bookInfo?.map((info) => /* @__PURE__ */ jsxs(Fragment, { children: [
	/* @__PURE__ */ jsxs("p", { children: [
		info.deliver,
		": ",
		info.price
	] }),
	"Buy from:",
	/* @__PURE__ */ jsx("ul", { children: info.from?.map((f) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", {
		href: f.link,
		children: f.name
	}) })) }),
	/* @__PURE__ */ jsx("b", { children: "FULL DETAILS" }),
	/* @__PURE__ */ jsx("table", { children: info.detail?.map((d) => /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: d.key }), /* @__PURE__ */ jsx("td", { children: d.value })] })) }),
	/* @__PURE__ */ jsx("br", {})
] }))] });
//#endregion
export { route };
