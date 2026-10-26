import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { load } from "cheerio";
//#region lib/routes/musify/index.ts
const handler = async (ctx) => {
	const { language = "" } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "30");
	const baseUrl = "https://musify.club";
	const targetUrl = new URL(language, baseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const items = $("div.playlist__item").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		const title = [$el.attr("data-artist"), $el.attr("data-name")].filter(Boolean).join(" - ");
		const linkUrl = $el.find("a.strong").attr("href");
		const authors = $el.find("div.playlist__heading a").toArray().map((authorEl) => {
			const $authorEl = $(authorEl);
			return {
				name: $authorEl.text(),
				url: $authorEl.attr("href") ? new URL($authorEl.attr("href"), baseUrl).href : void 0,
				avatar: void 0
			};
		});
		let processedItem = {
			title,
			link: linkUrl ? new URL(linkUrl, baseUrl).href : void 0,
			author: authors
		};
		const enclosureUrl = $el.find("div.playlist__control").attr("data-play-url");
		if (enclosureUrl) processedItem = {
			...processedItem,
			enclosure_url: new URL(enclosureUrl, baseUrl).href,
			enclosure_type: `audio/${enclosureUrl.split(/\./).pop()}`,
			enclosure_title: title,
			enclosure_length: void 0,
			itunes_duration: void 0,
			itunes_item_image: void 0
		};
		return processedItem;
	});
	return {
		title: $("title").text(),
		description: $("meta[property=\"og:description\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("meta[property=\"og:image\"]").attr("content"),
		author: $("meta[property=\"og:site_name\"]").attr("content"),
		id: $("meta[property=\"og:url\"]").attr("content")
	};
};
const route = {
	path: "/:language?",
	name: "Latest",
	url: "musify.club",
	maintainers: ["nczitzk"],
	handler,
	example: "/musify/en",
	parameters: { category: {
		description: "Language, Russian by default",
		options: [{
			label: "Russian",
			value: ""
		}, {
			label: "English",
			value: "en"
		}]
	} },
	description: `::: tip
To subscribe to [Latest](https://musify.club/en), where the source URL is \`https://musify.club/en\`, extract the certain parts from this URL to be used as parameters, resulting in the route as [\`/musify/en\`](https://rsshub.app/musify/en).
:::`,
	categories: ["multimedia"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportRadar: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [
		{
			source: ["musify.club/:language"],
			target: "/:language"
		},
		{
			title: "Latest",
			source: ["musify.club/en"],
			target: "/en"
		},
		{
			title: "​​Последняя",
			source: ["musify.club"],
			target: "/"
		}
	],
	view: 0
};
//#endregion
export { handler, route };
