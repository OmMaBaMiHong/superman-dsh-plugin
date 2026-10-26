import { t as md5 } from "./md5-CpIHIxCO.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/ikea/cn/utils.tsx
const generateRequestHeaders = () => {
	return {
		"X-Client-Platform": "WechatMiniprogram",
		"X-Client-DeviceId": md5(Math.round(Date.now() / 1e3).toString())
	};
};
const generateProductItem = (product) => {
	const { productFullId, name, productType, measureText, priceDisplay: { currentPrice, originalPrice }, images } = product;
	const isFamilyOffer = currentPrice && originalPrice;
	return {
		title: `${name} ${productType} - \u{000A5}${currentPrice}`,
		description: renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
			/* @__PURE__ */ jsxs("p", { children: ["名称：", name] }),
			/* @__PURE__ */ jsxs("p", { children: ["类型：", productType] }),
			/* @__PURE__ */ jsxs("p", { children: ["尺寸：", measureText] }),
			isFamilyOffer ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("p", { children: ["会员价格：\\u00A5", currentPrice] }), /* @__PURE__ */ jsxs("p", { children: ["非会员价格：\\u00A5", originalPrice] })] }) : /* @__PURE__ */ jsxs("p", { children: ["价格：\\u00A5", currentPrice] }),
			/* @__PURE__ */ jsx("p", { children: images.map((image) => /* @__PURE__ */ jsx("img", { src: image.url })) })
		] })),
		link: `https://www.ikea.cn/cn/zh/p/${productFullId}`
	};
};
//#endregion
export { generateRequestHeaders as n, generateProductItem as t };
