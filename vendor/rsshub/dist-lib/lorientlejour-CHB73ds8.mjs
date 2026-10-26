import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { FetchError } from "ofetch";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/lorientlejour/index.tsx
const key = "3d5_f6A(S$G_FD=2S(Dr6%7BW_h37@rE";
const route = {
	path: "/:category?",
	categories: ["traditional-media"],
	example: "/lorientlejour/977-lebanon",
	parameters: { category: "Category from the last segment of the URL of the corresponding site, see below for more information, /977-Lebanon by default" },
	features: {
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		requireConfig: [
			{
				name: "LORIENTLEJOUR_USERNAME",
				optional: true,
				description: `L'Orient-Le Jour/L'Orient Today Email or Username`
			},
			{
				name: "LORIENTLEJOUR_PASSWORD",
				optional: true,
				description: `L'Orient-Le Jour/L'Orient Today Password`
			},
			{
				name: "LORIENTLEJOUR_TOKEN",
				optional: true,
				description: `To obtain a token, log into L'Orient-Le Jour/L'Orient Today App and inspect the connection request to find the token parameter from the request URL`
			}
		]
	},
	name: "Category",
	maintainers: ["quiniapiezoelectricity"],
	handler,
	description: `::: tip
For example, the path for the sites <https://today.lorientlejour.com/section/977-lebanon> and <https://www.lorientlejour.com/rubrique/1-liban> would be /lorientlejour/977-lebanon and /lorientlejour/1-liban respectively.
Multiple categories seperated by '|' is also supported, e.g. /lorientlejour/977-lebanon|1-liban.
:::`,
	radar: [
		{
			source: ["www.lorientlejour.com/*/:category"],
			target: "/:category"
		},
		{
			source: ["www.lorientlejour.com"],
			target: "/1-Liban"
		},
		{
			source: ["today.lorientlejour.com/*/:category"],
			target: "/:category"
		},
		{
			source: ["today.lorientlejour.com"],
			target: "/977-Lebanon"
		}
	]
};
async function viewCategory(category) {
	const url = `https://www.lorientlejour.com/cmsapi/categories.php?key=${key}&action=view&categoryId=${category}`;
	return (await cache_default.tryGet(url, async () => await got_default({
		method: "get",
		url
	}), config.cache.routeExpire, false)).data.data[0];
}
async function handler(ctx) {
	const categoryId = (ctx.req.param("category") ?? "977-Lebanon").split("|").map((item) => item.match(/^(\d+)/)[0] ?? item);
	const limit = ctx.req.query("limit") ?? 25;
	let token;
	const cacheIn = await cache_default.get("lorientlejour:token");
	if (cacheIn) token = cacheIn;
	else if (config.lorientlejour.token) {
		token = config.lorientlejour.token;
		cache_default.set("lorientlejour:token", token);
	} else if (config.lorientlejour.username && config.lorientlejour.password) {
		token = (await got_default(`https://www.lorientlejour.com/cmsapi/visitors.php?key=${key}&action=login&loginName=${config.lorientlejour.username}&password=${config.lorientlejour.password}`)).data.data.token;
		cache_default.set("lorientlejour:token", token);
	}
	if (token) try {
		await got_default(`https://www.lorientlejour.com/cmsapi/visitors.php?key=${key}&action=login_token&token=${token}`);
	} catch (error) {
		if (error instanceof FetchError && error.statusCode === 403) await cache_default.set("lorientlejour:token", "");
		throw error;
	}
	let title = `L'Orient Le Jour/L'Orient Today`;
	let description = "";
	let link = "https://www.lorientlejour.com";
	let language = "";
	if (categoryId.length === 1) {
		const categoryInfo = await viewCategory(categoryId[0]);
		if (categoryInfo.typeId.locale) language = categoryInfo.typeId.locale;
		else language = categoryInfo.typeId.name === "English" ? "en-US" : "fr-FR";
		title = language === "en-US" ? `L'Orient Today - ${categoryInfo.name}` : `L'Orient Le Jour - ${categoryInfo.name}`;
		description = categoryInfo.description;
		link = categoryInfo.url;
	}
	const subcategories = await Promise.all(categoryId.map(async (id) => {
		return (await viewCategory(id)).children.map((child) => child.id);
	}));
	const categoriesParam = [.../* @__PURE__ */ new Set([...categoryId, ...subcategories.flat()])];
	let url = `https://www.lorientlejour.com/cmsapi/content.php?text=clean&key=${key}&action=search&category=${encodeURIComponent(JSON.stringify(categoriesParam))}&limit=${limit}&text=false&page=1`;
	if (token) url += `&token=${token}`;
	const items = (await got_default(url)).data.data.map((item) => {
		item.link = item.url;
		item.author = item.authors.map((author) => author.name).join(", ");
		item.pubDate = timezone(parseDate(item.firstPublished), 3);
		item.updated = timezone(parseDate(item.lastUpdate), 3);
		item.category = item.categories.map((itemCategory) => itemCategory.name);
		const contents = item.contents;
		const $ = load(contents);
		const article = $("html");
		article.find(".inline-embeded-article").remove();
		article.find(".relatedArticles").remove();
		if (item.inline_attachments) article.find(".inlineImage").each((_, el) => {
			const inlineImageSrc = $(el).attr("src");
			const inlineAttachment = item.inline_attachments.find((inlineAttachment) => inlineAttachment.url === inlineImageSrc);
			if (inlineAttachment && inlineAttachment.description) {
				$(el).wrap("<figure></figure>");
				$(el).after(`<figcaption>${inlineAttachment.description}</figcaption>`);
			}
		});
		item.description = renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
			item.summary ? /* @__PURE__ */ jsx("blockquote", { children: raw(item.summary) }) : null,
			item.attachments ? item.attachments.map((attachment) => attachment.url ? /* @__PURE__ */ jsxs("figure", { children: [/* @__PURE__ */ jsx("img", { src: attachment.url }), attachment.description ? /* @__PURE__ */ jsx("figcaption", { children: attachment.description }) : null] }) : null) : null,
			article.html() ? raw(article.html()) : null
		] }));
		return item;
	});
	return {
		title,
		description,
		language,
		link,
		item: items
	};
}
//#endregion
export { route };
