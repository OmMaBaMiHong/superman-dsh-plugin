import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/arcteryx/regear-new-arrivals.tsx
const host = "https://www.regear.arcteryx.com";
function getUSDPrice(number) {
	return (number / 100).toLocaleString("en-US", {
		style: "currency",
		currency: "USD"
	});
}
const route = {
	path: "/regear/new-arrivals",
	categories: ["shopping"],
	example: "/arcteryx/regear/new-arrivals",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["regear.arcteryx.com/shop/new-arrivals", "regear.arcteryx.com/"] }],
	name: "Regear New Arrivals",
	maintainers: ["EthanWng97"],
	handler,
	url: "regear.arcteryx.com/shop/new-arrivals"
};
async function handler() {
	const url = `${host}/shop/new-arrivals`;
	const data = (await got_default({
		method: "get",
		url
	})).data;
	const contents = load(data)("script:contains(\"window.__PRELOADED_STATE__\")").text();
	let items = JSON.parse(contents.match(/\{.*\}/)[0]).shop.items;
	items = items.filter((item) => item.availableSizes.length !== 0);
	return {
		title: "Arcteryx - Regear - New Arrivals",
		link: url,
		description: "Arcteryx - Regear - New Arrivals",
		item: items.map((item) => {
			const imgUrl = JSON.parse(item.imageUrls).front;
			const originalPrice = getUSDPrice(item.originalPrice);
			const regearPrice = item.priceRange[0] === item.priceRange[1] ? getUSDPrice(item.priceRange[0]) : `${getUSDPrice(item.priceRange[0])} - ${getUSDPrice(item.priceRange[1])}`;
			return {
				title: item.displayTitle,
				link: item.pdpLink.url,
				description: renderToString(/* @__PURE__ */ jsxs("div", { children: [
					"Available Sizes:\xA0",
					item.availableSizes.map((size) => /* @__PURE__ */ jsxs(Fragment, { children: [size, "\xA0"] })),
					/* @__PURE__ */ jsx("br", {}),
					"Color: ",
					item.color,
					/* @__PURE__ */ jsx("br", {}),
					"Original Price: ",
					originalPrice,
					/* @__PURE__ */ jsx("br", {}),
					"Regear Price: ",
					regearPrice,
					/* @__PURE__ */ jsx("br", {}),
					/* @__PURE__ */ jsx("img", { src: imgUrl }),
					/* @__PURE__ */ jsx("br", {}),
					/* @__PURE__ */ jsx("br", {})
				] }))
			};
		})
	};
}
//#endregion
export { route };
