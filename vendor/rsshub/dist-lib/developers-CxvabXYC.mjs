import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/google/developers.ts
const baseUrl = "https://developers.googleblog.com";
const route = {
	path: "/developers/:locale?",
	name: "Developers Blog",
	url: "developers.googleblog.com",
	maintainers: ["Loongphy"],
	handler,
	example: "/google/developers/en",
	parameters: { locale: {
		description: "language",
		default: "en",
		options: [
			{
				value: "en",
				label: "English"
			},
			{
				value: "es",
				label: "Español (Latam)"
			},
			{
				value: "id",
				label: "Bahasa Indonesia"
			},
			{
				value: "ja",
				label: "日本語"
			},
			{
				value: "ko",
				label: "한국어"
			},
			{
				value: "pt-br",
				label: "Português (Brasil)"
			},
			{
				value: "zh-hans",
				label: "简体中文"
			}
		]
	} },
	description: "Google Developers Blog",
	categories: ["blog"],
	radar: [{ source: ["developers.googleblog.com"] }]
};
async function handler(ctx) {
	const locale = ctx.req.param("locale") ?? "en";
	const $ = load(await rofetch(`${baseUrl}/${locale}/search`));
	const items = $(".search-result").toArray().map((element) => {
		const [date, category] = $(element).find(".search-result__eyebrow").text().trim().split(" / ");
		const titleElement = $(element).find(".search-result__title a");
		const title = titleElement.text().trim();
		const link = titleElement.attr("href");
		const summary = $(element).find(".search-result__summary").text().trim();
		return {
			title,
			link: `${baseUrl}${link}`,
			pubDate: parseDate(date),
			description: summary,
			author: "Google",
			category: [category]
		};
	});
	return {
		title: "Google Developers Blog",
		link: baseUrl,
		item: items
	};
}
//#endregion
export { route };
