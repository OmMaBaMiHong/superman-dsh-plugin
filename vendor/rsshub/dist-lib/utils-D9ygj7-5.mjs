import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/arcteryx/templates/product-description.tsx
const renderProductDescription = (item) => renderToString(/* @__PURE__ */ jsxs("div", { children: [
	item.short_description ? /* @__PURE__ */ jsxs(Fragment, { children: [item.short_description, /* @__PURE__ */ jsx("br", {})] }) : null,
	item.original_price ? /* @__PURE__ */ jsxs(Fragment, { children: [
		"Original Price: ",
		item.original_price,
		/* @__PURE__ */ jsx("br", {})
	] }) : null,
	item.price ? /* @__PURE__ */ jsxs(Fragment, { children: [
		"Current Price: ",
		item.price,
		/* @__PURE__ */ jsx("br", {})
	] }) : null,
	/* @__PURE__ */ jsx("img", { src: item.image })
] }));
//#endregion
//#region lib/routes/arcteryx/utils.ts
function generateRssData(item, index, arr, country) {
	const attributeSet = /* @__PURE__ */ new Set([
		"name",
		"image",
		"short_description",
		"slug",
		`price_${country}`,
		`discount_price_${country}`
	]);
	const attributes = item.attribute;
	const data = {};
	for (const attribute of attributes) {
		const key = attribute.name;
		const value = attribute.value[0].value;
		if (attributeSet.has(key)) if (key === `price_${country}`) data.original_price = value;
		else if (key === `discount_price_${country}`) data.price = value;
		else data[key] = value;
	}
	return arr[index] = data;
}
//#endregion
export { renderProductDescription as n, generateRssData as t };
