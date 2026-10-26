import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { Buffer } from "node:buffer";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import crypto from "node:crypto";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/mercari/util.tsx
const rootURL = "https://api.mercari.jp/";
const rootProductURL = "https://jp.mercari.com/item/";
const rootShopProductURL = "https://jp.mercari.com/shops/product/";
const searchURL = `${rootURL}v2/entities:search`;
const itemInfoURL = `${rootURL}items/get`;
const shopItemInfoURL = `${rootURL}v1/marketplaces/shops/products/`;
const uuidv4 = () => crypto.randomUUID();
const MercariStatus = {
	default: "",
	onsale: "STATUS_ON_SALE",
	soldout: "STATUS_SOLD_OUT"
};
const MercariSort = {
	default: "SORT_DEFAULT",
	create_time: "SORT_CREATED_TIME",
	like: "SORT_NUM_LIKES",
	score: "SORT_SCORE",
	price: "SORT_PRICE"
};
const MercariOrder = {
	desc: "ORDER_DESC",
	asc: "ORDER_ASC"
};
const renderItemDescription = (data) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	/* @__PURE__ */ jsxs("p", { children: [
		" ¥",
		data.price,
		" "
	] }),
	/* @__PURE__ */ jsx("p", { children: data.photos?.map((photo) => /* @__PURE__ */ jsx("img", {
		src: photo,
		style: "width:100%"
	})) }),
	/* @__PURE__ */ jsx("h2", { children: " 商品の説明 " }),
	/* @__PURE__ */ jsx("div", { children: raw(data.description.replaceAll("\n", "<br/>")) }),
	/* @__PURE__ */ jsx("h2", { children: " 商品の情報 " }),
	/* @__PURE__ */ jsxs("table", { children: [
		/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: "カテゴリー" }), /* @__PURE__ */ jsxs("td", { children: [
			data.item_category.root_category_name,
			" > ",
			data.item_category.parent_category_name,
			" > ",
			data.item_category.name
		] })] }),
		/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: "商品の状態" }), /* @__PURE__ */ jsxs("td", { children: [
			" ",
			data.item_condition.name,
			" "
		] })] }),
		/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: "配送料の負担" }), /* @__PURE__ */ jsxs("td", { children: [
			" ",
			data.shipping_payer.name,
			" "
		] })] }),
		/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: "配送の方法" }), /* @__PURE__ */ jsxs("td", { children: [
			" ",
			data.shipping_method.name,
			" "
		] })] }),
		/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: "発送元の地域" }), /* @__PURE__ */ jsxs("td", { children: [
			" ",
			data.shipping_from_area.name,
			" "
		] })] }),
		/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: "発送までの日数" }), /* @__PURE__ */ jsxs("td", { children: [
			" ",
			data.shipping_duration.name,
			" "
		] })] })
	] }),
	/* @__PURE__ */ jsx("h2", { children: " 出品者 " }),
	/* @__PURE__ */ jsxs("div", {
		style: "display:flex",
		children: [/* @__PURE__ */ jsx("img", {
			src: data.seller.photo_url,
			style: "width: 4em; height: 4em; border-radius: 50%;"
		}), /* @__PURE__ */ jsxs("p", { children: [" ", data.seller.name] })]
	})
] }));
const renderShopItemDescription = (detail) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	/* @__PURE__ */ jsxs("p", { children: [
		" ¥",
		detail.price,
		" "
	] }),
	/* @__PURE__ */ jsx("p", { children: detail.productDetail.photos?.map((photo) => /* @__PURE__ */ jsx("img", {
		src: photo,
		style: "width:100%"
	})) }),
	/* @__PURE__ */ jsx("h2", { children: " 商品の説明 " }),
	/* @__PURE__ */ jsx("div", { children: raw(detail.productDetail.description.replaceAll("\n", "<br/>")) }),
	/* @__PURE__ */ jsx("h2", { children: " 商品の情報 " }),
	/* @__PURE__ */ jsxs("table", { children: [
		/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: "カテゴリー" }), /* @__PURE__ */ jsxs("td", { children: [
			" ",
			[...detail.productDetail.categories].toReversed().map((item) => item.displayName).join(" > "),
			" "
		] })] }),
		/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: "商品の状態" }), /* @__PURE__ */ jsxs("td", { children: [
			" ",
			detail.productDetail.condition.displayName,
			" "
		] })] }),
		/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: "配送料の負担" }), /* @__PURE__ */ jsxs("td", { children: [
			" ",
			detail.productDetail.shippingPayer.displayName,
			" "
		] })] }),
		/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: "配送の方法" }), /* @__PURE__ */ jsxs("td", { children: [
			" ",
			detail.productDetail.shippingMethod.displayName,
			" "
		] })] }),
		/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: "発送元の地域" }), /* @__PURE__ */ jsxs("td", { children: [
			" ",
			detail.productDetail.shippingFromArea.displayName,
			" "
		] })] }),
		/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: "発送までの日数" }), /* @__PURE__ */ jsxs("td", { children: [
			" ",
			detail.productDetail.shippingDuration.displayName,
			" "
		] })] })
	] }),
	/* @__PURE__ */ jsx("h2", { children: " 出品者 " }),
	/* @__PURE__ */ jsxs("div", {
		style: "display:flex",
		children: [/* @__PURE__ */ jsx("img", {
			src: detail.productDetail.shop.thumbnail,
			style: "width: 4em; height: 4em; border-radius: 50%;"
		}), /* @__PURE__ */ jsxs("p", { children: [" ", detail.productDetail.shop.displayName] })]
	})
] }));
function bytesToBase64URL(b) {
	return b.toString("base64").replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}
function strToBase64URL(s) {
	return bytesToBase64URL(Buffer.from(s, "utf-8"));
}
function publicKeyToJWK(publicKey) {
	const jwk = publicKey.export({ format: "jwk" });
	return {
		crv: "P-256",
		kty: "EC",
		x: jwk.x,
		y: jwk.y
	};
}
function publicKeyToHeader(publicKey) {
	return {
		typ: "dpop+jwt",
		alg: "ES256",
		jwk: publicKeyToJWK(publicKey)
	};
}
function derDecode(der) {
	let offset = 0;
	if (der[offset++] !== 48) throw new Error("Invalid DER signature");
	const lenInfo = readDerLength(der, offset);
	offset += lenInfo.bytesRead;
	if (der[offset++] !== 2) throw new Error("Expected INTEGER for R");
	const rLen = readDerLength(der, offset);
	offset += rLen.bytesRead;
	const r = der.subarray(offset, offset + rLen.length);
	offset += rLen.length;
	if (der[offset++] !== 2) throw new Error("Expected INTEGER for S");
	const sLen = readDerLength(der, offset);
	offset += sLen.bytesRead;
	const s = der.subarray(offset, offset + sLen.length);
	offset += sLen.length;
	if (offset !== der.length) throw new Error("Extra bytes in DER signature");
	return {
		r: fixBufferLength(r, 32),
		s: fixBufferLength(s, 32)
	};
}
function readDerLength(buf, offset) {
	const byte = buf[offset];
	if (byte < 128) return {
		length: byte,
		bytesRead: 1
	};
	const bytesCount = byte & 127;
	if (bytesCount > 4) throw new Error("DER length too long");
	let length = 0;
	for (let i = 0; i < bytesCount; i++) length = length << 8 | buf[offset + 1 + i];
	return {
		length,
		bytesRead: 1 + bytesCount
	};
}
function fixBufferLength(buffer, length) {
	if (buffer.length > length) {
		const start = buffer.length - length;
		return buffer.subarray(start);
	}
	if (buffer.length < length) return Buffer.concat([Uint8Array.from(Buffer.alloc(length - buffer.length)), Uint8Array.from(buffer)]);
	return buffer;
}
function generateDPOP({ uuid, method, url }) {
	const { privateKey, publicKey } = crypto.generateKeyPairSync("ec", { namedCurve: "prime256v1" });
	const payload = {
		iat: Math.floor(Date.now() / 1e3),
		jti: uuid,
		htu: url,
		htm: method.toUpperCase()
	};
	const header = publicKeyToHeader(publicKey);
	const signingInput = `${strToBase64URL(JSON.stringify(header))}.${strToBase64URL(JSON.stringify(payload))}`;
	const sign = crypto.createSign("SHA256");
	sign.update(signingInput);
	const { r, s } = derDecode(sign.sign(privateKey));
	return `${signingInput}.${bytesToBase64URL(Buffer.concat([Uint8Array.from(r), Uint8Array.from(s)]))}`;
}
const fetchFromMercari = async function fetchFromMercari(url, data, method = "POST") {
	const DPOP = generateDPOP({
		uuid: uuidv4(),
		method,
		url
	});
	const options = {
		method,
		headers: new Headers({
			DPOP,
			"X-Platform": "web",
			"Accept-Encoding": "gzip, deflate",
			"Content-Type": "application/json; charset=utf-8"
		}),
		body: method === "POST" ? JSON.stringify(data) : void 0,
		query: method === "GET" ? data : void 0
	};
	try {
		return await rofetch(url, options);
	} catch (error) {
		throw new Error(`API request failed: ${error}`, { cause: error });
	}
};
const pageToPageToken = (page) => {
	if (page === 0) return "";
	return `v1:${page}`;
};
const fetchSearchItems = async (sort, order, status, keyword, options = {}) => {
	const data = {
		userId: `MERCARI_BOT_${uuidv4()}`,
		pageSize: 120,
		pageToken: pageToPageToken(0),
		searchSessionId: uuidv4(),
		indexRouting: "INDEX_ROUTING_UNSPECIFIED",
		thumbnailTypes: [],
		searchCondition: {
			keyword,
			excludeKeyword: options.excludeKeyword || "",
			sort,
			order,
			status: status || [],
			sizeId: [],
			categoryId: options.categoryId || [],
			brandId: options.brandId || [],
			sellerId: [],
			priceMin: options.priceMin || 0,
			priceMax: options.priceMax || 0,
			itemConditionId: options.itemConditionId || [],
			shippingPayerId: [],
			shippingFromArea: [],
			shippingMethod: [],
			colorId: [],
			hasCoupon: false,
			attributes: options.attributes || [],
			itemTypes: options.itemTypes || [],
			skuIds: [],
			shopIds: [],
			excludeShippingMethodIds: []
		},
		serviceFrom: "suruga",
		withItemBrand: true,
		withItemSize: false,
		withItemPromotions: true,
		withItemSizes: true,
		withShopname: false,
		useDynamicAttribute: true,
		withSuggestedItems: true,
		withOfferPricePromotion: true,
		withProductSuggest: true,
		withParentProducts: false,
		withProductArticles: true,
		withSearchConditionId: true,
		withAuction: true
	};
	logger.debug(JSON.stringify(data));
	return await fetchFromMercari(searchURL, data, "POST");
};
const fetchItemDetail = (item_id, item_type, country_code) => {
	if (item_type === "ITEM_TYPE_BEYOND") return fetchFromMercari(shopItemInfoURL + item_id, {
		view: "FULL",
		imageType: "JPEG"
	}, "GET");
	return fetchFromMercari(itemInfoURL, {
		id: item_id,
		country_code,
		include_item_attributes: true,
		include_product_page_component: true,
		include_non_ui_item_attributes: true,
		include_donation: true,
		include_offer_like_coupon_display: true,
		include_offer_coupon_display: true,
		include_item_attributes_sections: true,
		include_auction: false
	}, "GET");
};
const formatItemDetail = (detail) => {
	if (detail.displayName) {
		const shopItemDetail = detail;
		return {
			title: shopItemDetail.displayName,
			description: renderShopItemDescription(shopItemDetail),
			pubDate: parseDate(shopItemDetail.createTime),
			guid: shopItemDetail.name,
			link: `${rootShopProductURL}${shopItemDetail.name}`,
			image: shopItemDetail.thumbnail,
			language: "ja",
			author: shopItemDetail.productDetail.shop.displayName,
			updated: parseDate(shopItemDetail.updateTime)
		};
	}
	const itemDetail = detail;
	return {
		title: itemDetail.data.name,
		description: renderItemDescription(itemDetail.data),
		pubDate: parseDate(itemDetail.data.created * 1e3),
		guid: itemDetail.data.id,
		link: `${rootProductURL}${itemDetail.data.id}`,
		image: itemDetail.data.thumbnails[0],
		language: "ja",
		author: itemDetail.data.seller.name,
		updated: parseDate(itemDetail.data.updated * 1e3)
	};
};
//#endregion
export { fetchSearchItems as a, fetchItemDetail as i, MercariSort as n, formatItemDetail as o, MercariStatus as r, MercariOrder as t };
