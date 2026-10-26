import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/xiaomiyoupin/templates/goods.tsx
const GoodsFigure = (goods) => {
	const imageUrl = goods.pic_url || goods.img_square || goods.imgs?.img800;
	const marketPrice = goods.market_price ? goods.market_price / 100 : void 0;
	const salePrice = goods.price_min ?? goods.flash_price;
	const finalPrice = salePrice ? salePrice / 100 : void 0;
	return /* @__PURE__ */ jsxs("figure", { children: [
		/* @__PURE__ */ jsx("img", {
			src: imageUrl,
			alt: goods.alt,
			loading: "lazy",
			style: "display:block; margin-left:auto; margin-right:auto; width:100%;"
		}),
		goods.videos_url ? /* @__PURE__ */ jsx("video", {
			controls: true,
			playsinline: "true",
			"webkit-playsinline": "true",
			"x5-playsinline": "true",
			"x5-video-player-type": "h5",
			"x5-video-orientation": "landscape|portrait",
			"x5-video-player-fullscreen": "true",
			"x-webkit-airplay": "allow",
			preload: "metadata",
			poster: goods.pic_url || goods.imgs?.img800,
			children: /* @__PURE__ */ jsx("source", {
				src: goods.videos_url[0],
				type: "video/mp4"
			})
		}) : null,
		goods.name ? /* @__PURE__ */ jsxs("figcaption", { children: [
			/* @__PURE__ */ jsx("div", {
				class: "caption",
				children: raw(goods.name)
			}),
			/* @__PURE__ */ jsx("div", {
				class: "credit",
				children: raw(goods.summary ?? "")
			}),
			/* @__PURE__ */ jsxs("div", {
				class: "price",
				children: [
					"原始价格：",
					marketPrice,
					"元"
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				class: "price",
				children: [
					"实际价格：",
					finalPrice,
					"元"
				]
			})
		] }) : null
	] });
};
const renderGoods = (goods) => renderToString(/* @__PURE__ */ jsx(GoodsFigure, { ...goods }));
//#endregion
export { renderGoods as t };
