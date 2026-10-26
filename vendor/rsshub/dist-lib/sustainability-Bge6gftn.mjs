import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
//#region lib/routes/pwc/sustainability.ts
const route = {
	path: "/strategyand/sustainability",
	categories: ["other"],
	example: "/pwc/strategyand/sustainability",
	radar: [{ source: ["strategyand.pwc.com/at/en/functions/sustainability-strategy/publications.html", "strategyand.pwc.com/"] }],
	name: "Sustainability",
	maintainers: ["mintyfrankie"],
	handler,
	url: "strategyand.pwc.com/at/en/functions/sustainability-strategy/publications.html"
};
async function handler() {
	const baseUrl = "https://www.strategyand.pwc.com/at/en/functions/sustainability-strategy/publications.html";
	const feedLang = "en";
	const feedDescription = "Sustainability Publications from PwC Strategy&";
	const response = await rofetch("https://www.strategyand.pwc.com/content/pwc/03/en/functions/sustainability-strategy/publications/jcr:content/root/container/content-free-container/section_545483788/collection_v2.filter-dynamic.html", { query: {
		currentPagePath: "/content/pwc/03/en/functions/sustainability-strategy/publications",
		list: { menu_0: [] },
		defaultImagePath: "/content/dam/pwc/network/strategyand-collection-fallback-images"
	} });
	return {
		title: "PwC Strategy& - Sustainability Publications",
		link: baseUrl,
		language: feedLang,
		description: feedDescription,
		item: JSON.parse(response.elements).map((item) => ({
			title: item.title,
			link: item.href,
			pubDate: parseDate(item.publishDate, "DD/MM/YY"),
			description: item.text,
			category: item.tags
		}))
	};
}
//#endregion
export { route };
