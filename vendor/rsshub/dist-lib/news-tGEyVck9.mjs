import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/who/news.ts
const route = {
	path: "/news/:language?",
	categories: ["government"],
	example: "/who/news",
	parameters: { language: "Language, see below, English by default" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["who.int/news"],
		target: "/news"
	}],
	name: "News",
	maintainers: ["nczitzk"],
	handler,
	url: "who.int/news",
	description: `Language

| English | العربية | 中文 | Français | Русский | Español | Português |
| ------- | ------- | ---- | -------- | ------- | ------- | --------- |
| en      | ar      | zh   | fr       | ru      | es      | pt        |`
};
async function handler(ctx) {
	const language = ctx.req.param("language") ?? "en";
	const rootUrl = "https://www.who.int";
	const currentUrl = `${rootUrl}/${language === "en" ? "" : `${language}/`}news`;
	const list = (await got_default({
		method: "get",
		url: `${rootUrl}/api/news/newsitems?sf_culture=${language}&$orderby=PublicationDateAndTime%20desc&$select=Title,PublicationDateAndTime,ItemDefaultUrl`
	})).data.value.map((item) => ({
		title: item.Title,
		link: `${currentUrl}/item/${item.ItemDefaultUrl}`,
		pubDate: parseDate(item.PublicationDateAndTime)
	}));
	return {
		title: "News - WHO",
		link: currentUrl,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			item.description = (await got_default({
				method: "get",
				url: item.link
			})).data.match(/"description":"(.*)","datePublished"/)[1];
			return item;
		})))
	};
}
//#endregion
export { route };
