import { t as got_default } from "./got-Dnzt41dd.mjs";
import { jsx } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/zagg/new-arrivals.tsx
const host = "https://www.zagg.com/en_us";
const route = {
	path: "/new-arrivals/:query?",
	categories: ["shopping"],
	example: "/zagg/new-arrivals/brand=164&cat=3038,3041",
	parameters: { query: "query, search page querystring" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "New Arrivals",
	maintainers: ["EthanWng97"],
	handler,
	description: "For instance, in `https://www.zagg.com/en_us/new-arrivals?brand=164&cat=3038%2C3041`, the query is `brand=164&cat=3038%2C3041`"
};
async function handler(ctx) {
	const query = ctx.req.param("query");
	const params = new URLSearchParams(query);
	const brands = params.get("brand");
	const categories = params.get("cat");
	const response = await got_default({
		headers: { "X-Requested-With": "XMLHttpRequest" },
		method: "post",
		url: `${host}/new-arrivals`,
		searchParams: {
			cat: categories,
			brand: brands
		}
	});
	const products = response.data.products;
	const $ = load(products);
	const list = $(".item.product.product-item").toArray().map((element) => {
		const data = {};
		const details = $(element).find(".product.details-box").html();
		data.link = $(element).find(".product-item-link").eq(0).attr("href");
		data.title = $(element).find(".product-item-link").text();
		const imgUrl = $(element).find("img").eq(0).attr("data-src").match(/(https.*?)\?/)[1];
		data.description = details + renderToString(/* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("img", { src: imgUrl }) }));
		return data;
	});
	return {
		title: "Zagg - New Arrivals",
		link: response.url,
		description: "Zagg - New Arrivals",
		item: list.map((item) => ({
			title: item.title,
			description: item.description,
			link: item.link
		}))
	};
}
//#endregion
export { route };
