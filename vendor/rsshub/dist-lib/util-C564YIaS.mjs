import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/cyzone/util.ts
const rootUrl = "https://www.cyzone.cn";
const apiRootUrl = "https://api1.cyzone.cn";
const apiShowUrl = new URL("v2/content/app_content/show", apiRootUrl).href;
/**
* Retrieves information from a given URL.
* @param {string} url        - The URL to retrieve information from.
* @returns {Promise<Object>} - A promise that resolves to an object containing the retrieved information.
*/
const getInfo = (url) => cache_default.tryGet(url, async () => {
	const { data: response } = await got_default(url);
	const $ = load(response);
	const avatar = $("img.avatar")?.prop("src")?.split("?", 1)[0] ?? void 0;
	const icon = new URL($("link[rel=\"icon\"]")?.prop("href"), rootUrl).href;
	const image = new URL($("div.logo img")?.prop("src"), rootUrl).href;
	return {
		title: $("title").text(),
		link: url,
		description: $("meta[name=\"description\"]").prop("content"),
		language: "zh-cn",
		image: avatar || image,
		icon,
		logo: icon,
		subtitle: $("meta[name=\"keywords\"]").prop("content"),
		author: $("meta[name=\"app-mobile-web-app-title\"]").prop("content")
	};
});
/**
* Process the item list and return the resulting array.
* @param {string} apiUrl          - The URL of the API.
* @param {number} limit           - The limit of the results.
* @param {...Object} searchParams - The search parameter objects.
* @returns {Promise<Array>}       - The processed item array.
*/
const processItems = async (apiUrl, limit, ...params) => {
	let searchParams = { size: limit };
	for (const param of params) searchParams = {
		...searchParams,
		...param
	};
	const { data: response } = await got_default(apiUrl, { searchParams });
	let items = (response.data?.article ?? response.data?.data ?? response.data).slice(0, limit).map((item) => {
		item = item.item ?? item;
		return {
			title: item.title,
			link: item.url.startsWith("//") ? `https:${item.url}` : item.url,
			description: item.description,
			category: [item.category_name, ...item.tags?.split(",") ?? []],
			guid: item.content_id,
			pubDate: parseDate(item.published_at * 1e3),
			upvotes: item.votes ?? 0
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(`cyzone-${item.guid}`, async () => {
		const { data: detailResponse } = await got_default.post(apiShowUrl, { json: { content_id: item.guid } });
		const data = detailResponse.data;
		const categories = [
			data.category,
			...item.category,
			...data.tags?.split(",") ?? []
		];
		const content = load(data.content);
		content("img").each((_, el) => {
			if (content(el).prop("src")) content(el).prop("src", content(el).prop("src").split("?", 1)[0]);
			else content(el).remove();
		});
		item.title = data.title;
		item.link = `${rootUrl}/article/${item.guid}.html`;
		item.description = content.html();
		item.author = data.author_name ?? data.author;
		item.category = [...new Set(categories)].filter(Boolean);
		item.guid = `cyzone-${item.guid}`;
		item.pubDate = parseDate(data.published_at * 1e3);
		item.upvotes = data.votes ?? 0;
		return item;
	})));
	return items;
};
//#endregion
export { rootUrl as i, getInfo as n, processItems as r, apiRootUrl as t };
