import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { t as parser } from "./rss-parser-lNYr71DQ.mjs";
import { load } from "cheerio";
//#region lib/routes/wordpress/util.ts
const apiSlug = "wp-json/wp/v2";
const filterKeys = { search: "s" };
const filterApiKeys = {
	category: "categories",
	tag: "tags",
	search: void 0
};
const filterApiKeysWithNoId = /* @__PURE__ */ new Set(["search"]);
/**
* Bake filter search parameters.
*
* @param filterPairs - The filter pairs object.
*                      e.g. `{ category: [ { id: ..., name: ..., slug: ... }, { id: ..., name: ..., slug: ... } ], tag: [ { id: ..., name: ..., slug: ... } ] }`.
* @param pairKey - The filter pair key.
*                  e.g. `{ id: ..., name: ..., slug: ... }`.
* @param isApi - Indicates if the search parameters are for API.
* @returns The baked filter search parameters.
*/
const bakeFilterSearchParams = (filterPairs, pairKey, isApi = false) => {
	/**
	* Bake filters recursively.
	*
	* @param filterPairs - The filter pairs object.
	*                      e.g. `{ category: [ { id: ..., name: ..., slug: ... }, { id: ..., name: ..., slug: ... } ], tag: [ { id: ..., name: ..., slug: ... } ] }`.
	* @param filterSearchParams - The filter search parameters.
	*                             e.g. `category=a,b&tag=c`.
	* @returns The baked filter search parameters.
	*          e.g. `category=a,b&tag=c`.
	*/
	const bakeFilters = (filterPairs, filterSearchParams) => {
		const keys = Object.keys(filterPairs).filter((key) => filterPairs[key]?.length > 0 && (isApi ? Object.hasOwn(filterApiKeys, key) : Object.hasOwn(filterKeys, key)));
		if (keys.length === 0) return filterSearchParams;
		const key = keys[0];
		const pairs = filterPairs[key];
		const originalFilters = { ...filterPairs };
		delete originalFilters[key];
		const filterKey = getFilterKeyForSearchParams(key, isApi);
		const pairValues = pairs.map((pair) => Object.hasOwn(pair, pairKey) ? pair[pairKey] : pair);
		if (filterKey) filterSearchParams.append(filterKey, pairValues.join(","));
		return bakeFilters(originalFilters, filterSearchParams);
	};
	return bakeFilters(filterPairs, new URLSearchParams());
};
/**
* Bake filters with pair.
*
* @param filters - The filters object.
*                  e.g. `{ category: [ a, b ], tag: [ c ] }`.
* @returns The baked filters.
*          e.g. `{ category: [ { id: ..., name: ..., slug: ... }, { id: ..., name: ..., slug: ... } ], tag: [ { id: ..., name: ..., slug: ... } ] }`.
*/
const bakeFiltersWithPair = async (filters, rootUrl) => {
	/**
	* Bake keywords recursively.
	*
	* @param key - The key.
	*              e.g. `category` or `tag`.
	* @param keywords - The keywords.
	*                   e.g. `[ a, b ]`.
	* @returns The baked keywords.
	*          e.g. `[ { id: ..., name: ..., slug: ... }, { id: ..., name: ..., slug: ... } ]`.
	*/
	const bakeKeywords = async (key, keywords) => {
		if (keywords.length === 0) return [];
		const [keyword, ...rest] = keywords;
		const filter = await getFilterByKeyAndKeyword(key, keyword, rootUrl);
		return [...filter?.id && filter.slug ? [{
			id: filter.id,
			name: filter.name,
			slug: filter.slug
		}] : [], ...await bakeKeywords(key, rest)];
	};
	/**
	* Bake filters recursively.
	*
	* @param filters - The filters object.
	*                  e.g. `{ category: [ a, b ], tag: [ c ] }`.
	* @param filtersWithPair - The filters with pairs.
	*                          e.g. `{ category: [ { id: ..., name: ..., slug: ... }, { id: ..., name: ..., slug: ... } ], tag: [ { id: ..., name: ..., slug: ... } ] }`.
	* @returns The baked filters.
	*          e.g. `{ category: [ { id: ..., name: ..., slug: ... }, { id: ..., name: ..., slug: ... } ], tag: [ { id: ..., name: ..., slug: ... } ] }`.
	*/
	const bakeFilters = async (filters, filtersWithPair) => {
		const keys = Object.keys(filters);
		if (keys.length === 0) return filtersWithPair;
		const key = keys[0];
		const keywords = filters[key];
		const originalFilters = { ...filters };
		delete originalFilters[key];
		return bakeFilters(originalFilters, {
			...filtersWithPair,
			[key]: filterApiKeysWithNoId.has(key) ? keywords : await bakeKeywords(key, keywords)
		});
	};
	return await bakeFilters(filters, {});
};
/**
* Bake URL with search parameters.
*
* @param url - The URL.
* @param rootUrl - The root URL.
* @param searchParams - The search parameters.
* @returns The baked URL.
*/
const bakeUrl = (url, rootUrl, searchParams = new URLSearchParams()) => {
	const searchParamsStr = searchParams.toString();
	return `${rootUrl}/${url}${searchParamsStr ? `?${searchParamsStr}` : ""}`;
};
/**
* Fetch data from the specified URL.
*
* @param url - The URL to fetch data from.
* @param rootUrl - The root URL.
* @returns A promise that resolves to an object containing the fetched data to be added into `ctx.state.data`.
*/
const fetchData = async (url, rootUrl) => {
	/**
	* Request URLs recursively.
	*
	* @param urls - The URLs to request.
	* @returns A promise that resolves to the response data or undefined if no response is available.
	*/
	const requestUrls = async (urls) => {
		if (urls.length === 0) return;
		const [currentUrl, ...remainingUrls] = urls;
		try {
			const { data: response } = await got_default.get(currentUrl);
			return response;
		} catch {
			return requestUrls(remainingUrls);
		}
	};
	const response = await requestUrls([url, rootUrl]);
	if (!response) return {};
	const $ = load(response);
	const title = $("title").first().text();
	const image = new URL($("link[rel=\"icon\"]").last().attr("href") ?? "wp-content/uploads/site_logo.png", rootUrl).href;
	return {
		title,
		description: $("meta[property=\"og:description\"]").attr("content") || $("meta[name=\"description\"]").attr("content"),
		link: url,
		allowEmpty: true,
		image,
		author: $("meta[property=\"og:site_name\"]").attr("content"),
		language: $("html").attr("lang")
	};
};
/**
* Get filter by key and keyword.
*
* @param key - The key.
*              e.g. `category` or `tag`.
* @param keyword - The keywords.
*                  e.g. `keyword1`.
* @returns A promise that resolves to the filter object if found, or undefined if not found.
*/
const getFilterByKeyAndKeyword = async (key, keyword, rootUrl) => {
	const { data: response } = await got_default(`${rootUrl}/${apiSlug}/${getFilterKeyForSearchParams(key, true)}`, { searchParams: { search: keyword } });
	return response.length > 0 ? response[0] : void 0;
};
/**
* Get filter key for search parameters.
*
* @param key - The key. e.g. `category` or `tag`.
* @param isApi - Indicates whether the key is for the API.
* @returns The filter key for search parameters, or undefined if not found.
*          e.g. `categories` or `tags`.
*/
const getFilterKeyForSearchParams = (key, isApi = false) => {
	const keys = isApi ? filterApiKeys : filterKeys;
	return Object.hasOwn(keys, key) ? keys[key] ?? key : void 0;
};
/**
* Get filter parameters for URL.
*
* @param filterPairs - The filter pairs object.
*                      e.g. `{ category: [ { id: ..., name: ..., slug: ... }, { id: ..., name: ..., slug: ... } ], tag: [ { id: ..., name: ..., slug: ... } ] }`.
* @returns The filter parameters for the URL, or undefined if no filters are available.
*/
const getFilterParamsForUrl = (filterPairs) => {
	const keys = Object.keys(filterPairs).filter((key) => filterPairs[key].length > 0 && !Object.hasOwn(filterKeys, key));
	if (keys.length === 0) return;
	const key = keys[0];
	return `${key}/${filterPairs[key].map((pair) => pair.slug).join("/")}`;
};
/**
* Parses a filter string into a filters object.
*
* @param filterStr - The filter string to parse.
*                    e.g. `category/a,b/tag/c`.
* @returns The parsed filters object.
*          e.g. `{ category: [ 'a', 'b' ], tag: [ 'c' ] }`.
*/
const parseFilterStr = (filterStr) => {
	/**
	* Recursively parses a filter string.
	*
	* @param remainingStr - The remaining filter string to parse.
	*                       e.g. `category/a,b/tag/c`.
	* @param filters - The accumulated filters object.
	*                  e.g. `{ category: [ a, b ], tag: [ c ] }`.
	* @param currentKey - The current filter key.
	*                     e.g. `category` or `tag`.
	* @returns The parsed filters object.
	*/
	const parseStr = (remainingStr, filters = {}, currentKey) => {
		if (!remainingStr) return filters;
		const [word, ...rest] = remainingStr.split(/\/|,/);
		const isKey = Object.hasOwn(filterApiKeys, word);
		const key = isKey ? word : currentKey;
		const newFilters = key ? {
			...filters,
			[key]: [...filters[key] || [], ...isKey ? [] : [word]]
		} : filters;
		return parseStr(rest.join("/"), newFilters, key);
	};
	return parseStr(filterStr, {});
};
//#endregion
//#region lib/routes/wordpress/index.ts
async function handler(ctx) {
	const { url = "https://wordpress.org/news", filter } = ctx.req.param();
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 50;
	if (!config.feature.allow_user_supply_unsafe_domain) throw new ConfigNotFoundError(`This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`);
	if (!/^https?:\/\/[^\s#$./?].\S*$/i.test(url)) throw new Error("Invalid URL");
	const cdn = config.wordpress.cdnUrl;
	const rootUrl = url;
	const filters = parseFilterStr(filter);
	const filtersWithPair = await bakeFiltersWithPair(filters, rootUrl);
	const searchParams = bakeFilterSearchParams(filters, "name", false);
	const apiSearchParams = bakeFilterSearchParams(filtersWithPair, "id", true);
	apiSearchParams.append("_embed", "true");
	apiSearchParams.append("per_page", String(limit));
	const apiUrl = bakeUrl(`${apiSlug}/posts`, rootUrl, apiSearchParams);
	const currentUrl = bakeUrl(getFilterParamsForUrl(filtersWithPair) ?? "", rootUrl, searchParams);
	try {
		const { data: response } = await got_default(apiUrl);
		const items = (Array.isArray(response) ? response : JSON.parse(response.match(/(\[.*\])$/)[1])).slice(0, limit).map((item) => {
			const terminologies = item._embedded["wp:term"];
			const guid = item.guid?.rendered ?? item.guid;
			const $$ = load(item.content?.rendered ?? item.content);
			$$("img").each((_, el) => {
				el = $$(el);
				const src = el.prop("src");
				if (src.startsWith("/")) el.prop("src", `${cdn}${item.link}${src}`);
				else if (src.startsWith("http:")) el.prop("src", `${cdn}${src}`);
			});
			const description = $$.html();
			return {
				title: item.title?.rendered ?? item.title,
				description,
				pubDate: parseDate(item.date_gmt),
				link: item.link,
				category: [...new Set(terminologies.flat().map((c) => c.name))],
				author: item._embedded.author.map((a) => a.name).join("/"),
				guid,
				id: guid,
				content: {
					html: description,
					text: $$.text()
				},
				updated: parseDate(item.modified_gmt)
			};
		});
		return {
			...await fetchData(currentUrl, rootUrl),
			item: items
		};
	} catch {
		const feed = await parser.parseURL(`${rootUrl}/feed/`);
		const items = feed.items.map((item) => {
			const guid = item.guid;
			const $$ = load(item["content:encoded"]);
			$$("img").each((_, el) => {
				el = $$(el);
				const src = el.prop("src");
				if (src.startsWith("/")) el.prop("src", `${cdn}${item.link}${src}`);
				else if (src.startsWith("http:")) el.prop("src", `${cdn}${src}`);
			});
			const description = $$.html();
			return {
				title: item.title,
				description,
				pubDate: parseDate(item.pubDate ?? ""),
				link: item.link,
				category: item.categories,
				author: item.creator,
				guid,
				id: guid,
				content: {
					html: description,
					text: $$.text()
				}
			};
		});
		return {
			title: feed.title,
			description: feed.description,
			link: feed.link,
			item: items,
			allowEmpty: true,
			image: feed.image?.url,
			language: feed.language
		};
	}
}
const route = {
	path: "/:url?/:filter{.+}?",
	name: "WordPress",
	url: "wordpress.org",
	maintainers: ["nczitzk"],
	handler,
	example: "/wordpress/https%3A%2F%2Fwordpress.org%2Fnews/category/Podcast",
	parameters: {
		url: "URL, <https://wordpress.org/news> by default",
		filter: "Filter, see below"
	},
	description: `If you subscribe to [WordPress News](https://wordpress.org/news/)，where the URL is \`https://wordpress.org/news/\`, Encode the URL using \`encodeURIComponent()\` and then use it as the parameter. Therefore, the route will be [\`/wordpress/https%3A%2F%2Fwordpress.org%2Fnews\`](https://rsshub.app/wordpress/https%3A%2F%2Fwordpress.org%2Fnews).

::: tip
If you wish to subscribe to specific categories or tags, you can fill in the "filter" parameter in the route. \`/category/Podcast\` to subscribe to the Podcast category. In this case, the route would be [\`/wordpress/https%3A%2F%2Fwordpress.org%2Fnews/category/Podcast\`](https://rsshub.app/wordpress/https%3A%2F%2Fwordpress.org%2Fnews/category/Podcast).

You can also subscribe to multiple categories. \`/category/Podcast,Community\` to subscribe to both the Podcast and Community categories. In this case, the route would be [\`/wordpress/https%3A%2F%2Fwordpress.org%2Fnews/category/Podcast,Community\`](https://rsshub.app/wordpress/https%3A%2F%2Fwordpress.org%2Fnews/category/Podcast,Community).

Categories and tags can be combined as well. \`/category/Releases/tag/tagging\` to subscribe to the Releases category and the tagging tag. In this case, the route would be [\`/wordpress/https%3A%2F%2Fwordpress.org%2Fnews/category/Releases/tag/tagging\`](https://rsshub.app/wordpress/https%3A%2F%2Fwordpress.org%2Fnews/category/Releases/tag/tagging).

You can also search for keywords. \`/search/Blog\` to search for the keyword "Blog". In this case, the route would be [\`/wordpress/https%3A%2F%2Fwordpress.org%2Fnews/search/Blog\`](https://rsshub.app/wordpress/https%3A%2F%2Fwordpress.org%2Fnews/search/Blog).
:::`,
	categories: ["blog"],
	features: {
		requireConfig: [{
			name: "ALLOW_USER_SUPPLY_UNSAFE_DOMAIN",
			description: `This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`,
			optional: false
		}],
		requirePuppeteer: false,
		antiCrawler: false,
		supportRadar: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: []
};
//#endregion
export { route };
