import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/who/speeches.ts
const route = {
	path: "/speeches/:language?",
	categories: ["government"],
	example: "/who/speeches",
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
		source: ["who.int/director-general/speeches"],
		target: "/speeches"
	}],
	name: "Speeches",
	maintainers: ["nczitzk"],
	handler,
	url: "who.int/director-general/speeches",
	description: `Language

| English | العربية | 中文 | Français | Русский | Español | Português |
| ------- | ------- | ---- | -------- | ------- | ------- | --------- |
| en      | ar      | zh   | fr       | ru      | es      | pt        |`
};
async function handler(ctx) {
	const language = ctx.req.param("language") || "en";
	const rootUrl = "https://www.who.int";
	const currentUrl = `${rootUrl}/${language === "en" ? "" : `${language}/`}director-general/speeches`;
	const list = (await got_default({
		method: "get",
		url: `${rootUrl}/api/hubs/speeches?sf_culture=${language}&$orderby=PublicationDateAndTime%20desc&$select=Title,PublicationDateAndTime,ItemDefaultUrl`
	})).data.value.map((item) => ({
		title: item.Title,
		link: `${currentUrl}/detail/${item.ItemDefaultUrl}`,
		pubDate: parseDate(item.PublicationDateAndTime)
	}));
	return {
		title: "Speeches - WHO",
		link: currentUrl,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			item.description = load((await got_default({
				method: "get",
				url: item.link
			})).data)(".sf-detail-body-wrapper").html();
			return item;
		})))
	};
}
//#endregion
export { route };
