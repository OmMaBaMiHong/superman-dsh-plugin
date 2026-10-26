import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
//#region lib/routes/thoughtworks/index.ts
const route = {
	path: "/blog",
	categories: ["programming"],
	example: "/thoughtworks/blog",
	radar: [{ source: ["www.thoughtworks.com/zh-cn/insights/blog"] }],
	name: "Inside Blog",
	maintainers: ["Hyvi"],
	handler
};
async function handler() {
	return {
		title: "ThoughtWorks Blog",
		link: "https://www.thoughtworks.com/zh-cn/insights/blog",
		item: (await rofetch("https://platform-eu.cloud.coveo.com/rest/search/v2?organizationId=thoughtworksproductionhcqoag0q", {
			method: "POST",
			headers: {
				authorization: "Bearer " + (await rofetch("https://www.thoughtworks.com/rest/search/config", { headers: {
					"content-type": "application/json",
					origin: "https://www.thoughtworks.com",
					referer: "https://www.thoughtworks.com/"
				} })).BLOG_SEARCH_TOKEN,
				"content-type": "application/json",
				origin: "https://www.thoughtworks.com",
				referer: "https://www.thoughtworks.com/"
			},
			body: {
				context: { countryLocale: "zh-cn" },
				fieldsToInclude: [
					"author",
					"language",
					"objecttype",
					"collection",
					"source",
					"tw_content_type",
					"tw_topic",
					"tw_published_date"
				],
				sortCriteria: "@tw_published_date descending",
				numberOfResults: 10,
				firstResult: 0
			}
		})).results.map((item) => ({
			title: item.title,
			link: item.uri,
			description: item.excerpt,
			pubDate: parseDate(item.raw.tw_published_date),
			author: item.raw.sysauthor
		}))
	};
}
//#endregion
export { route };
