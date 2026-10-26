import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
//#region lib/routes/dataguidance/index.ts
const route = {
	name: "News",
	example: "/dataguidance/news",
	path: "/news",
	radar: [{ source: ["www.dataguidance.com/info"] }],
	maintainers: ["harveyqiu"],
	handler,
	url: "https://www.dataguidance.com/info?article_type=news_post"
};
async function handler() {
	const rootUrl = "https://www.dataguidance.com";
	let items = (await rofetch("https://www.dataguidance.com/api/v1/kb/content/articles?news_types=510&news_types=511&news_types=512&news_types=513&order=DESC_publishedOn&limit=25&article_types=news_post")).data.map((item) => ({
		title: item.title.en,
		link: `${rootUrl}${item.url}`,
		url: item.url,
		pubDate: parseDate(item.publishedOn)
	}));
	const baseUrl = "https://www.dataguidance.com/api/v1/kb/content/articles/by_path?path=";
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = (await rofetch(`${baseUrl}${item.url}`)).contentBody?.html.en.replaceAll("\n", "<br>");
		delete item.url;
		return item;
	})));
	return {
		title: "Data Guidance News",
		link: "https://www.dataguidance.com/info?article_type=news_post",
		item: items
	};
}
//#endregion
export { route };
