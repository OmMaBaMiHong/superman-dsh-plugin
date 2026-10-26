import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/snowpeak/us-new-arrivals.tsx
const host = "https://www.snowpeak.com";
const route = {
	path: "/us/new-arrivals",
	categories: ["shopping"],
	example: "/snowpeak/us/new-arrivals",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["snowpeak.com/collections/new-arrivals", "snowpeak.com/"] }],
	name: "New Arrivals(USA)",
	maintainers: ["EthanWng97"],
	handler,
	url: "snowpeak.com/collections/new-arrivals"
};
async function handler() {
	const data = (await got_default({
		method: "get",
		url: `${host}/collections/new-arrivals`
	})).data;
	const $ = load(data);
	const list = $(".element.product-tile").toArray().map((element) => {
		const data = {};
		const product = $(element).find(".product-data").data("product");
		data.title = product.title;
		data.link = `${host}/products/${product.handle}`;
		data.pubDate = new Date(product.published_at).toUTCString();
		data.category = product.tags;
		data.variants = product.variants.map((item) => item.name);
		data.description = product.description + renderToString(/* @__PURE__ */ jsxs("div", { children: [
			"Variant:",
			/* @__PURE__ */ jsx("br", {}),
			product.variants.map((variant) => /* @__PURE__ */ jsxs(Fragment, { children: [variant.name, /* @__PURE__ */ jsx("br", {})] })),
			product.images.map((image) => /* @__PURE__ */ jsx("img", { src: image }))
		] }));
		return data;
	});
	return {
		title: "Snow Peak - New Arrivals",
		link: `${host}/new-arrivals`,
		description: "Snow Peak - New Arrivals",
		item: list.map((item) => ({
			title: item.title,
			category: item.category,
			description: item.description,
			pubDate: item.pubDate,
			link: item.link
		}))
	};
}
//#endregion
export { route };
