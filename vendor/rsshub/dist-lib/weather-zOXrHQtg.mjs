import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import * as cheerio from "cheerio";
//#region lib/routes/hko/weather.ts
const handler = async () => {
	const url = "http://rss.weather.gov.hk/rss/CurrentWeather.xml";
	const pageUrl = "https://www.weather.gov.hk/en/wxinfo/currwx/current.htm";
	const data = await rofetch(url);
	const $ = cheerio.load(data, { xmlMode: true });
	const description = $("item").first().find("description");
	const items = cheerio.load(description.text())("table tr").toArray().map((item) => {
		const $item = $(item);
		const area = $item.find("td").first().text();
		return {
			title: area,
			description: $item.find("td").last().text(),
			pubDate: parseDate($("pubDate").text()),
			link: pageUrl,
			guid: `${$("guid").text()}#${area}`
		};
	});
	return {
		title: "Current Weather Report",
		description: `provided by the Hong Kong Observatory: ${$("pubDate").text()}`,
		link: pageUrl,
		item: items
	};
};
const route = {
	path: "/weather",
	radar: [{ source: ["www.weather.gov.hk/en/wxinfo/currwx/current.htm"] }],
	name: "Current Weather Report",
	example: "/hko/weather",
	maintainers: ["calpa"],
	categories: ["forecast"],
	handler,
	url: "www.weather.gov.hk/en/wxinfo/currwx/current.htm"
};
//#endregion
export { route };
