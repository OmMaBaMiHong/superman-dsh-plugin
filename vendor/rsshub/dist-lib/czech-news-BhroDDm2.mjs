import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/expats/czech-news.ts
const handler = async (ctx) => {
	const { category = "daily-news" } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "30");
	const baseUrl = "https://www.expats.cz";
	const targetUrl = new URL(`czech-news/${category}`, baseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "en";
	let items = $("div.main h3 a").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		return {
			title: $el.text(),
			link: new URL($el.attr("href"), baseUrl).href,
			language
		};
	});
	items = await Promise.all(items.map((item) => {
		if (!item.link) return item;
		return cache_default.tryGet(item.link, async () => {
			const $$ = load(await rofetch(item.link));
			$$("div.promo-widget, div.eas").remove();
			const title = $$("div.title h1").text();
			const description = $$("div#expats-article-content").html() ?? void 0;
			const pubDateStr = $$("meta[property=\"article:published_time\"]").attr("content");
			const categories = [$$("meta[property=\"article:section\"]").attr("content") ?? ""];
			const authors = $$("span.written-by a").toArray().map((authorEl) => {
				const $$authorEl = $$(authorEl);
				return {
					name: $$authorEl.text(),
					url: $$authorEl.attr("href") ? new URL($$authorEl.attr("href"), baseUrl).href : void 0,
					avatar: $$("div.authors div.photos a img").attr("src") ? new URL($$("div.authors div.photos a img").attr("src"), baseUrl).href : void 0
				};
			});
			const image = $$("meta[property=\"og:image\"]").attr("content");
			const upDatedStr = pubDateStr;
			const processedItem = {
				title,
				description,
				pubDate: pubDateStr ? parseDate(pubDateStr) : item.pubDate,
				category: categories,
				author: authors,
				content: {
					html: description,
					text: description
				},
				image,
				banner: image,
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
		description: $("meta[property=\"og:description\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("meta[property=\"og:image\"]").attr("content"),
		author: $("meta[property=\"og:site_name\"]").attr("content"),
		language,
		id: targetUrl
	};
};
const route = {
	path: "/czech-news/:category?",
	name: "Czech News",
	url: "www.expats.cz",
	maintainers: ["nczitzk"],
	handler,
	example: "/expats/czech-news/daily-news",
	parameters: { category: {
		description: "Category, `daily-news` by default",
		options: [
			{
				label: "Daily News",
				value: "daily-news"
			},
			{
				label: "Prague Guide",
				value: "prague-guide"
			},
			{
				label: "Culture & Events",
				value: "culture-events"
			},
			{
				label: "Food & Drink",
				value: "food-drink"
			},
			{
				label: "Expat Life",
				value: "expat-life"
			},
			{
				label: "Housing",
				value: "housing"
			},
			{
				label: "Education",
				value: "education"
			},
			{
				label: "Health",
				value: "health"
			},
			{
				label: "Work",
				value: "work"
			},
			{
				label: "Travel",
				value: "travel"
			},
			{
				label: "Economy",
				value: "economy"
			},
			{
				label: "Language",
				value: "language"
			}
		]
	} },
	description: `::: tip
To subscribe to [Daily News](https://www.expats.cz/czech-news/daily-news), where the source URL is \`https://www.expats.cz/czech-news/daily-news\`, extract the certain parts from this URL to be used as parameters, resulting in the route as [\`/expats/czech-news/daily-news\`](https://rsshub.app/expats/czech-news/daily-news).
:::

<details>
  <summary>More categories</summary>

| Category                                                      | ID                                                                    |
| ------------------------------------------------------------- | --------------------------------------------------------------------- |
| [Daily News](https://www.expats.cz/czech-news/daily-news)     | [daily-news](https://rsshub.app/expats/czech-news/daily-news)         |
| [Prague Guide](https://www.expats.cz/czech-news/prague-guide) | [prague-guide](https://rsshub.app/expats/czech-news/prague-guide)     |
| [Culture](https://www.expats.cz/czech-news/culture-events)    | [culture-events](https://rsshub.app/expats/czech-news/culture-events) |
| [Food & Drink](https://www.expats.cz/czech-news/food-drink)   | [food-drink](https://rsshub.app/expats/czech-news/food)               |
| [Expat Life](https://www.expats.cz/czech-news/expat-life)     | [expat-life](https://rsshub.app/expats/czech-news/expat-life)         |
| [Housing](https://www.expats.cz/czech-news/housing)           | [housing](https://rsshub.app/expats/czech-news/housing)               |
| [Education](https://www.expats.cz/czech-news/education)       | [education](https://rsshub.app/expats/czech-news/education)           |
| [Health](https://www.expats.cz/czech-news/health)             | [health](https://rsshub.app/expats/czech-news/health)                 |
| [Work](https://www.expats.cz/czech-news/work)                 | [work](https://rsshub.app/expats/czech-news/work)                     |
| [Travel](https://www.expats.cz/czech-news/travel)             | [travel](https://rsshub.app/expats/czech-news/travel)                 |
| [Economy](https://www.expats.cz/czech-news/economy)           | [economy](https://rsshub.app/expats/czech-news/economy)               |
| [Language](https://www.expats.cz/czech-news/language)         | [language](https://rsshub.app/expats/czech-news/language)             |

</details>`,
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
	radar: [
		{
			source: ["www.expats.cz/czech-news/:category"],
			target: (params) => {
				const category = params.category;
				return `/expats/czech-news${category ? `/${category}` : ""}`;
			}
		},
		{
			title: "Daily News",
			source: ["www.expats.cz/czech-news/daily-news"],
			target: "/expats/czech-news/daily-news"
		},
		{
			title: "Prague Guide",
			source: ["www.expats.cz/czech-news/prague-guide"],
			target: "/expats/czech-news/prague-guide"
		},
		{
			title: "Culture & Events",
			source: ["www.expats.cz/czech-news/culture-events"],
			target: "/expats/czech-news/culture-events"
		},
		{
			title: "Food & Drink",
			source: ["www.expats.cz/czech-news/food-drink"],
			target: "/expats/czech-news/food-drink"
		},
		{
			title: "Expat Life",
			source: ["www.expats.cz/czech-news/expat-life"],
			target: "/expats/czech-news/expat-life"
		},
		{
			title: "Housing",
			source: ["www.expats.cz/czech-news/housing"],
			target: "/expats/czech-news/housing"
		},
		{
			title: "Education",
			source: ["www.expats.cz/czech-news/education"],
			target: "/expats/czech-news/education"
		},
		{
			title: "Health",
			source: ["www.expats.cz/czech-news/health"],
			target: "/expats/czech-news/health"
		},
		{
			title: "Work",
			source: ["www.expats.cz/czech-news/work"],
			target: "/expats/czech-news/work"
		},
		{
			title: "Travel",
			source: ["www.expats.cz/czech-news/travel"],
			target: "/expats/czech-news/travel"
		},
		{
			title: "Economy",
			source: ["www.expats.cz/czech-news/economy"],
			target: "/expats/czech-news/economy"
		},
		{
			title: "Language",
			source: ["www.expats.cz/czech-news/language"],
			target: "/expats/czech-news/language"
		}
	],
	view: 0
};
//#endregion
export { handler, route };
