import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/ikea/gb/new.tsx
const route = {
	path: "/gb/new",
	categories: ["shopping"],
	example: "/ikea/gb/new",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["ikea.com/gb/en/new/new-products/", "ikea.com/"] }],
	name: "UK - New Product Release",
	maintainers: ["HenryQW"],
	handler,
	url: "ikea.com/gb/en/new/new-products/"
};
async function handler() {
	const link = "https://www.ikea.com/gb/en/new/new-products/";
	const { data: { specialPage } } = await got_default("https://sik.search.blue.cdtapps.com/gb/en/special", { searchParams: { special: "new_product" } });
	const { data: { moreProducts } } = await got_default("https://sik.search.blue.cdtapps.com/gb/en/special/more-products", { searchParams: {
		special: "new_product",
		start: 24,
		end: specialPage.productCount
	} });
	const { productWindow } = moreProducts;
	return {
		title: "New Products - Browse All New Furniture & Home Decor  - IKEA",
		link,
		description: "New products released by IKEA UK.",
		item: [...specialPage.productWindow, ...productWindow].map((p) => ({
			title: `${p.name} ${p.typeName}, ${p.itemMeasureReferenceText}`,
			description: renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsx("img", {
					src: p.mainImageUrl,
					alt: p.mainImageAlt
				}),
				/* @__PURE__ */ jsx("br", {}),
				/* @__PURE__ */ jsx("b", { children: p.name }),
				/* @__PURE__ */ jsx("br", {}),
				p.typeName,
				", ",
				p.itemMeasureReferenceText,
				/* @__PURE__ */ jsx("br", {}),
				p.salesPrice.current.prefix,
				" ",
				/* @__PURE__ */ jsx("b", { children: p.salesPrice.current.wholeNumber })
			] })),
			link: p.pipUrl,
			category: p.categoryPath.map((c) => c.name)
		}))
	};
}
//#endregion
export { route };
