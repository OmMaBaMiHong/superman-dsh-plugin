import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/diariofruticola/filtro.ts
const handler = async (ctx) => {
	const { filter } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "30");
	const baseUrl = "https://diariofruticola.cl";
	const targetUrl = new URL(`filtro/${filter}`, baseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "es";
	let items = $("div#printableArea a.text-dark").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		const title = $el.text();
		const linkUrl = $el.attr("href");
		return {
			title,
			link: linkUrl ? new URL(linkUrl, baseUrl).href : void 0,
			language
		};
	});
	items = (await Promise.all(items.map((item) => {
		if (!item.link) return item;
		return cache_default.tryGet(item.link, async () => {
			const detailResponse = await rofetch(item.link);
			const $$ = load(detailResponse);
			const title = $$("h1.my-2").text();
			const description = $$("div.ck-content").html() ?? "";
			const pubDateStr = detailResponse.match(/"datePublished":\s"(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})"/)?.[1] ?? void 0;
			const upDatedStr = detailResponse.match(/"dateModified":\s"(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})"/)?.[1] ?? void 0;
			const processedItem = {
				title,
				description,
				pubDate: pubDateStr ? timezone(parseDate(pubDateStr), -3) : item.pubDate,
				content: {
					html: description,
					text: description
				},
				updated: upDatedStr ? timezone(parseDate(upDatedStr), -3) : item.updated,
				language
			};
			return {
				...item,
				...processedItem
			};
		});
	}))).filter((_) => true);
	return {
		title: $("title").text(),
		description: $("meta[property=\"og:description\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("img#logo").attr("src"),
		author: $("meta[name=\"keywords\"]").attr("content"),
		language,
		id: $("meta[property=\"og:url\"]").attr("content")
	};
};
const route = {
	path: "/filtro/:filter{.+}",
	name: "Filtro",
	url: "diariofruticola.cl",
	maintainers: ["nczitzk"],
	handler,
	example: "/diariofruticola/filtro/cerezas/71",
	parameters: { filter: { description: "Filter" } },
	description: `::: tip
If you subscribe to [Cerezas](https://www.diariofruticola.cl/filtro/cerezas/71/)，where the URL is \`https://www.diariofruticola.cl/filtro/cerezas/71/\`, extract the part \`https://diariofruticola.cl/filtro\` to the end, which is \`/\`, and use it as the parameter to fill in. Therefore, the route will be [\`/diariofruticola/filtro/cerezas/71\`](https://rsshub.app/diariofruticola/filtro/cerezas/71).
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
		source: ["diariofruticola.cl/filtro/:filter"],
		target: (params) => {
			const filter = params.filter;
			return `/diariofruticola/filtro${filter ? `/${filter}` : ""}`;
		}
	}],
	view: 0
};
//#endregion
export { handler, route };
