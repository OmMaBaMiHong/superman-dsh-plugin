import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/routledge/book-series.tsx
const route = {
	path: "/:bookName/book-series/:bookId",
	radar: [{ source: ["routledge.com/:bookName/book-series/:bookId"] }],
	name: "Unknown",
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	const { bookName, bookId } = ctx.req.param();
	const pageUrl = `https://www.routledge.com/${bookName}/book-series/${bookId}`;
	const { data: response } = await got_default(pageUrl, {
		headers: { accept: "text/html, */*; q=0.01" },
		searchParams: {
			publishedFilter: "alltitles",
			pd: "published,forthcoming",
			pg: 1,
			pp: 12,
			so: "pub",
			view: "list"
		}
	});
	const $ = load(response);
	const list = $(".row.book").toArray().map((item) => {
		item = $(item);
		const title = item.find("h3 a");
		const description = item.find("p.description");
		const meta = item.find("p.description").prev().text().split("\n");
		return {
			title: title.text(),
			link: title.attr("href"),
			description: description.text(),
			pubDate: parseDate(meta.pop().trim(), "MMMM DD, YYYY"),
			author: meta.map((i) => i.trim()).filter(Boolean).join(", ")
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const { data } = await got_default(item.link);
		const $ = load(data);
		const { data: image } = await got_default("https://productimages.routledge.com", { searchParams: {
			isbn: $("meta[property=\"books:isbn\"]").attr("content"),
			size: "amazon",
			ext: "jpg"
		} });
		const description = $(".sticky-div");
		description.find("button.accordion-button").contents().unwrap();
		description.find(".fa-shopping-cart").parent().parent().remove();
		item.description = renderDescription(image, description.html());
		return item;
	})));
	return {
		title: $("head title").text(),
		description: $("head meta[name=\"description\"]").attr("content"),
		link: pageUrl,
		item: items
	};
}
const renderDescription = (image, description) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [image ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", { src: image }), /* @__PURE__ */ jsx("br", {})] }) : null, description ? raw(description) : null] }));
//#endregion
export { route };
