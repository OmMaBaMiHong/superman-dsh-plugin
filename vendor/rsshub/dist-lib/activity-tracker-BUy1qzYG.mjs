import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/digitalpolicyalert/activity-tracker.ts
const createSearchParams = (queryString, limit = 30) => {
	const params = new URLSearchParams(queryString);
	params.set("offset", "0");
	params.set("limit", limit.toString());
	return params;
};
const searchParamsToObject = (searchParams) => {
	const obj = {};
	for (const [key, value] of searchParams) obj[key] = value;
	return obj;
};
const handler = async (ctx) => {
	const { filters } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "30");
	const params = createSearchParams(filters, limit);
	const baseUrl = "https://digitalpolicyalert.org";
	const apiBaseUrl = "https://api.globaltradealert.org";
	const targetUrl = new URL(`activity-tracker?${params.toString()}`, baseUrl).href;
	const apiUrl = new URL("dpa/intervention/", apiBaseUrl).href;
	const response = await rofetch(apiUrl, {
		query: searchParamsToObject(params),
		headers: { Accept: "application/json" }
	});
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "en";
	const items = (response.results ?? []).slice(0, limit).map((item) => {
		const title = item.title;
		const description = item.latest_event?.description ?? void 0;
		const pubDate = item.latest_event?.date;
		const linkUrl = item.slug ? `change/${item.slug}` : void 0;
		const categories = [.../* @__PURE__ */ new Set([
			...item.economic_activities?.map((activity) => activity.name) ?? [],
			...item.implementers?.map((implementer) => implementer.name) ?? [],
			...item.policies?.map((policy) => policy.name) ?? [],
			item.status?.name,
			item.type?.name
		])].filter(Boolean);
		const authors = item.implementers?.map((author) => ({
			name: author.name,
			url: void 0,
			avatar: void 0
		})) ?? void 0;
		const updated = pubDate;
		return {
			title,
			description,
			pubDate: pubDate ? parseDate(pubDate) : void 0,
			link: linkUrl ? new URL(linkUrl, baseUrl).href : void 0,
			category: categories,
			author: authors,
			content: {
				html: description,
				text: description
			},
			updated: updated ? parseDate(updated) : void 0,
			language
		};
	});
	return {
		title: $("title").text(),
		description: $("meta[property=\"og:description\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("meta[property=\"og:image\"]").attr("content") ? new URL($("meta[property=\"og:image\"]").attr("content"), baseUrl).href : void 0,
		author: $("meta[property=\"og:site_name\"]").attr("content"),
		language,
		id: $("meta[property=\"og:url\"]").attr("content")
	};
};
const route = {
	path: "/activity-tracker/:filters?",
	name: "Activity Tracker",
	url: "digitalpolicyalert.org",
	maintainers: ["nczitzk", "pseudoyu"],
	handler,
	example: "/digitalpolicyalert/activity-tracker",
	parameters: { filter: { description: "Filter, all by default" } },
	description: `::: tip
To subscribe to [Activity Tracker - International trade](https://digitalpolicyalert.org/activity-tracker?policy=1), where the source URL is \`https://digitalpolicyalert.org/activity-tracker?policy=1\`, extract the certain parts from this URL to be used as parameters, resulting in the route as [\`/digitalpolicyalert/activity-tracker/policy=1\`](https://rsshub.app/digitalpolicyalert/activity-tracker/policy=1).
:::`,
	categories: ["other"],
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
		source: ["digitalpolicyalert.org"],
		target: (_, url) => {
			const urlObj = new URL(url);
			const filters = createSearchParams(urlObj.searchParams.toString()).toString();
			return `/digitalpolicyalert/activity-tracker${filters ? `/${filters}` : ""}`;
		}
	}],
	view: 0
};
//#endregion
export { handler, route };
