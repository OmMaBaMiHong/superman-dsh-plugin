import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/costar/press-releases.ts
const handler = async (ctx) => {
	const { filter } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "10");
	const targetUrl = new URL(`products/benchmark/resources/press-releases${filter ? `?${filter}` : ""}`, "https://www.costar.com").href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "en";
	let items = $("div.views-row article").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		const $aEl = $el.find("a.coh-link").first();
		const title = $aEl.text();
		const description = $el.find("div.coh-container").eq(3).html() ?? void 0;
		const pubDateStr = $el.find("div.coh-container").eq(4).text();
		const linkUrl = $aEl.attr("href");
		const categoryEls = $el.find("div.coh-style-tags a").toArray();
		const categories = [...new Set(categoryEls.map((el) => $(el).text()).filter(Boolean))];
		const upDatedStr = pubDateStr;
		return {
			title,
			description,
			pubDate: pubDateStr ? parseDate(pubDateStr) : void 0,
			link: linkUrl,
			category: categories,
			content: {
				html: description,
				text: description
			},
			updated: upDatedStr ? parseDate(upDatedStr) : void 0,
			language
		};
	});
	items = await Promise.all(items.map((item) => {
		if (!item.link) return item;
		return cache_default.tryGet(item.link, async () => {
			const detailResponse = await rofetch(item.link);
			const $$ = load(detailResponse);
			const title = $$("h1.coh-heading").text();
			const description = $$("div.coh-body").html() ?? item.description;
			const pubDateStr = detailResponse.match(/"datePublished": "(.*?)",/)?.[1];
			const upDatedStr = detailResponse.match(/"dateModified": "(.*?)",/)?.[1];
			const processedItem = {
				title,
				description,
				pubDate: pubDateStr ? parseDate(pubDateStr) : item.pubDate,
				content: {
					html: description,
					text: description
				},
				updated: upDatedStr ? parseDate(upDatedStr) : item.updated,
				language
			};
			return {
				...item,
				...processedItem
			};
		});
	}));
	return {
		title: $("title").text(),
		description: $("meta[property=\"og:title\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		author: $("meta[property=\"og:site_name\"]").attr("content"),
		language,
		id: targetUrl
	};
};
const route = {
	path: "/press-releases/:filter{.+}?",
	name: "Press Releases",
	url: "www.costar.com",
	maintainers: ["nczitzk"],
	handler,
	example: "/costar/press-releases",
	parameters: { filter: { description: "Filter" } },
	description: `::: tip
To subscribe to [Press Releases - Asia Pacific - Preliminary](https://www.costar.com/products/benchmark/resources/press-releases?region=406\\&tag=581), where the source URL is \`https://www.costar.com/products/benchmark/resources/press-releases?region=406&tag=581\`, extract the certain parts from this URL to be used as parameters, resulting in the route as [\`/costar/press-releases/region=406&tag=581\`](https://rsshub.app/costar/press-releases/region=406\\&tag=581).
:::`,
	categories: ["new-media"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportRadar: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["www.costar.com"],
		target: (_, url) => {
			const filter = new URL(url).search?.replace(/\?/, "");
			return `/costar/press-releases${filter ? `/${filter}` : ""}`;
		}
	}],
	view: 0
};
//#endregion
export { handler, route };
