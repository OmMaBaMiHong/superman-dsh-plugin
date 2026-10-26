import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/secretsanfrancisco/rss.tsx
const route = {
	path: "/:category?",
	categories: ["new-media"],
	example: "/secretsanfrancisco/top-news",
	parameters: { category: "category name, can be found in url" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["secretsanfrancisco.com/:category"],
		target: "/:category"
	}],
	name: "Category",
	maintainers: ["EthanWng97"],
	handler
};
async function handler(ctx) {
	const baseUrl = "https://secretsanfrancisco.com";
	const categoryApiPath = "/wp-json/wp/v2/categories";
	const postApiPath = "/wp-json/wp/v2/posts";
	const categorySlug = ctx.req.param("category") || "";
	let category;
	if (categorySlug) category = await cache_default.tryGet(`${baseUrl}${categoryApiPath}`, async () => {
		const { data } = await got_default(`${baseUrl}${categoryApiPath}`, { searchParams: { slug: categorySlug } });
		if (!data || data.length === 0) throw new Error(`Category "${categorySlug}" not found`);
		return data[0];
	});
	const categoryId = category?.id;
	const categoryName = category?.name;
	const categoryLink = category?.link;
	const items = (await got_default(`${baseUrl}${postApiPath}`, { searchParams: {
		per_page: ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 10,
		_embed: "",
		...categoryId && { categories: categoryId }
	} })).data.filter((item) => item.language === "en").map((item) => {
		const featuredMedia = item._embedded?.["wp:featuredmedia"]?.find((v) => v.id === item.featured_media);
		const image = featuredMedia?.source_url;
		const altText = featuredMedia?.alt_text || featuredMedia?.title?.rendered;
		let caption;
		if (featuredMedia?.caption?.rendered) caption = load(featuredMedia?.caption?.rendered);
		return {
			title: item.title.rendered,
			description: renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [image ? /* @__PURE__ */ jsxs("figure", { children: [altText ? /* @__PURE__ */ jsx("img", {
				src: image,
				alt: altText
			}) : /* @__PURE__ */ jsx("img", { src: image }), /* @__PURE__ */ jsx("figcaption", { children: caption?.text() || "" })] }) : null, item.content?.rendered ? raw(item.content.rendered) : null] })),
			link: item.link,
			pubDate: parseDate(item.date_gmt),
			updated: parseDate(item.modified_gmt),
			image,
			author: item._embedded.author[0].name
		};
	});
	return {
		title: categoryName ? `Secret San Francisco - ${categoryName}` : "Secret San Francisco",
		link: categoryLink || `${baseUrl}/${categorySlug}`,
		item: items
	};
}
//#endregion
export { route };
