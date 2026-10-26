import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
//#region lib/routes/bestblogs/feeds.ts
const route = {
	path: "/feeds/:category?",
	categories: ["programming"],
	example: "/bestblogs/feeds/featured",
	parameters: { category: "the category of articles. Can be `programming`, `ai`, `product`, `business` or `featured`. Default is `featured`" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "文章列表",
	maintainers: ["zhenlohuang"],
	handler
};
var APIRequest = class {
	keyword;
	qualifiedFilter;
	sourceId;
	category;
	timeFilter;
	language;
	userLanguage;
	sortType;
	currentPage;
	pageSize;
	constructor({ keyword = "", qualifiedFilter = "true", sourceId = "", category = "", timeFilter = "1w", language = "all", userLanguage = "zh", sortType = "default", currentPage = 1, pageSize = 10 } = {}) {
		this.keyword = keyword;
		this.qualifiedFilter = qualifiedFilter;
		this.sourceId = sourceId;
		this.category = category;
		this.timeFilter = timeFilter;
		this.language = language;
		this.userLanguage = userLanguage;
		this.sortType = sortType;
		this.currentPage = currentPage;
		this.pageSize = pageSize;
	}
	toJson() {
		const requestBody = {
			keyword: this.keyword,
			qualifiedFilter: this.qualifiedFilter,
			sourceId: this.sourceId,
			category: this.category,
			timeFilter: this.timeFilter,
			language: this.language,
			userLanguage: this.userLanguage,
			sortType: this.sortType,
			currentPage: this.currentPage,
			pageSize: this.pageSize
		};
		return JSON.stringify(requestBody);
	}
};
async function handler(ctx) {
	const defaultPageSize = 100;
	const defaultTimeFilter = "1w";
	const { category = "featured" } = ctx.req.param();
	const response = await rofetch("https://api.bestblogs.dev/api/resource/list", {
		headers: { "Content-Type": "application/json" },
		method: "POST",
		body: new APIRequest({
			category,
			pageSize: defaultPageSize,
			qualifiedFilter: category === "featured" ? "true" : "false",
			timeFilter: defaultTimeFilter
		}).toJson()
	});
	if (!response || !response.data || !response.data.dataList) throw new Error("Invalid API response: " + JSON.stringify(response));
	return {
		title: "Bestblogs.dev",
		link: "https://www.bestblogs.dev/feeds",
		item: response.data.dataList.map((article) => ({
			title: article.title,
			link: article.url,
			description: article.summary,
			pubDate: parseDate(article.publishDateTimeStr),
			author: Array.isArray(article.authors) ? article.authors.map((author) => ({ name: author })) : [{ name: article.authors }],
			category: article.category
		}))
	};
}
//#endregion
export { route };
