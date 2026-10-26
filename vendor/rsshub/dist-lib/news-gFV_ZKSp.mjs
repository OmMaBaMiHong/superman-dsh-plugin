import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/i-cable/news.tsx
const route = {
	path: "/news/:category?",
	categories: ["traditional-media"],
	example: "/i-cable/news",
	parameters: { category: "分類，默認為新聞資訊" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["www.i-cable.com"],
		target: "/news"
	}, {
		source: ["www.i-cable.com/category/:category"],
		target: "/news/:category"
	}],
	name: "新聞",
	maintainers: ["quiniapiezoelectricity"],
	handler,
	url: "www.i-cable.com/",
	description: `::: tip
分類只可用分類名稱，如：新聞資訊 / 港聞
:::`
};
async function handler(ctx) {
	const category = ctx.req.param("category") ?? "新聞資訊";
	const limit = ctx.req.query("limit") ?? 20;
	const root = "https://www.i-cable.com/wp-json/wp/v2";
	const response = await cache_default.tryGet(`${root}/categories?slug=${category}`, async () => await got_default(`${root}/categories?slug=${category}`), config.cache.routeExpire, false);
	if (response.data.length < 1) throw new InvalidParameterError(`Invalid Category: ${category}`);
	const metadata = response.data[0];
	const items = (await got_default(`${root}/posts?_embed=1&categories=${metadata.id}&per_page=${limit}`)).data.map((item) => {
		const description = renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [item._embedded["wp:featuredmedia"]?.length ? item._embedded["wp:featuredmedia"].map((media) => /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", { src: media.source_url }) })) : null, item.content.rendered ? raw(item.content.rendered) : null] }));
		return {
			title: item.title.rendered,
			link: item.link,
			pubDate: item.date_gmt,
			description,
			category: item._embedded["wp:term"][0].map((term) => term.name) ?? []
		};
	});
	return {
		title: `有線新聞 - ${metadata.name}`,
		description: metadata.description,
		link: metadata.link,
		item: items
	};
}
//#endregion
export { route };
