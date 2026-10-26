import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/nintendo/templates/eshop-us.tsx
const renderEshopUsDescription = (data) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("p", { children: [
	data.availability && data.availability.includes("Pre-order") ? /* @__PURE__ */ jsxs(Fragment, { children: ["预售中", /* @__PURE__ */ jsx("br", {})] }) : null,
	data.releaseDateDisplay ? /* @__PURE__ */ jsxs(Fragment, { children: ["预计发售时间：", data.releaseDateDisplay] }) : null,
	data.price ? /* @__PURE__ */ jsxs(Fragment, { children: [
		"当前价格：",
		data.price.finalPrice === 0 ? "免费" : `$${data.price.finalPrice}`,
		/* @__PURE__ */ jsx("br", {}),
		data.price.salePrice ? /* @__PURE__ */ jsxs(Fragment, { children: [
			"原价：$",
			data.price.regPrice,
			/* @__PURE__ */ jsx("br", {})
		] }) : null
	] }) : null,
	data.genres ? /* @__PURE__ */ jsxs(Fragment, { children: [
		"类别：",
		data.genres.join(", "),
		/* @__PURE__ */ jsx("br", {})
	] }) : null,
	data.softwareDeveloper ? /* @__PURE__ */ jsxs(Fragment, { children: [
		"开发商：",
		data.softwareDeveloper,
		/* @__PURE__ */ jsx("br", {})
	] }) : null,
	data.softwarePublisher ? /* @__PURE__ */ jsxs(Fragment, { children: [
		"发行商：",
		data.softwarePublisher,
		/* @__PURE__ */ jsx("br", {})
	] }) : null
] }), /* @__PURE__ */ jsx("p", { children: data.description })] }));
//#endregion
//#region lib/routes/nintendo/eshop-us.ts
const route = {
	path: "/eshop/us",
	radar: [{ source: ["nintendo.com/store/games", "nintendo.com/"] }],
	name: "Unknown",
	maintainers: [],
	handler,
	url: "nintendo.com/store/games"
};
async function handler(ctx) {
	const response = await got_default.post("https://u3b6gr4ua3-dsn.algolia.net/1/indexes/store_game_en_us_release_des/query", {
		headers: {
			"x-algolia-api-key": "a29c6927638bfd8cee23993e51e721c9",
			"x-algolia-application-id": "U3B6GR4UA3"
		},
		json: { params: new URLSearchParams({
			hitsPerPage: 40,
			page: 0,
			facetFilters: JSON.stringify([["availability:Available now", "availability:Pre-order"]])
		}).toString() }
	});
	const data = response.data.hits;
	ctx.set("json", response.data);
	return {
		title: "Nintendo eShop（美服）新游戏",
		link: "https://www.nintendo.com/store/games/",
		description: "Nintendo eShop（美服）新上架的游戏",
		item: data.map((item) => ({
			title: item.title,
			description: renderEshopUsDescription(item),
			link: `https://www.nintendo.com${item.url}`
		}))
	};
}
//#endregion
export { route };
