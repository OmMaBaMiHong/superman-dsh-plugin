import { t as config } from "./config-B5Cf_tHS.mjs";
import "./types-DNj6Etbg.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { jsx } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/pixabay/search.tsx
const route = {
	path: "/search/:q/:order?",
	categories: ["picture"],
	view: 2,
	example: "/pixabay/search/cat",
	parameters: {
		q: "Search term",
		order: {
			description: "Order",
			options: [{
				value: "popular",
				label: "popular"
			}, {
				value: "latest",
				label: "latest"
			}],
			default: "latest"
		}
	},
	features: {
		requireConfig: [{
			name: "PIXABAY_KEY",
			optional: true,
			description: ""
		}],
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["pixabay.com/:searchType/search/:q"],
		target: "/search/:q"
	}],
	name: "Search",
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	const { q, order = "latest" } = ctx.req.param();
	const key = config.pixabay?.key ?? "7329690-bbadad6d872ba577d5a358679";
	const baseUrl = "https://pixabay.com";
	const items = (await cache_default.tryGet(`pixabay:search:${q}:${order}`, async () => {
		const { data } = await got_default(`${baseUrl}/api/`, { searchParams: {
			key,
			q,
			order,
			per_page: ctx.req.query("limit") ?? 200
		} });
		return data;
	}, Math.max(config.cache.contentExpire, 1440 * 60), false)).hits.map((item) => {
		const { pageURL, tags, user } = item;
		const lastSlashIndex = pageURL.lastIndexOf("/");
		const secondLastSlashIndex = pageURL.lastIndexOf("/", lastSlashIndex - 1);
		return {
			title: pageURL.slice(secondLastSlashIndex + 1, lastSlashIndex).replace(/(-\d+)$/, "").replaceAll("-", " "),
			description: renderToString(/* @__PURE__ */ jsx(PixabayImage, { item })),
			link: pageURL,
			category: tags.split(", "),
			author: user
		};
	});
	return {
		title: `Search ${q} - Pixabay`,
		description: "Download & use free nature stock photos in high resolution ✓ New free images everyday ✓ HD to 4K ✓ Best nature pictures for all devices on Pixabay",
		link: `${baseUrl}/images/search/${q}/${order === "latest" ? "?order=latest" : ""}`,
		image: "https://pixabay.com/apple-touch-icon.png",
		language: "en",
		item: items
	};
}
const PixabayImage = ({ item }) => /* @__PURE__ */ jsx("img", { src: item.largeImageURL || item.webformatURL || item.previewURL });
//#endregion
export { route };
