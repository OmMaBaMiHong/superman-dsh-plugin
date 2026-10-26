import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/instructables/projects.ts
const route = {
	path: "/projects/:category?",
	categories: ["other"],
	example: "/instructables/projects/circuits",
	parameters: { category: "Category, empty by default, can be found in URL or see the table below" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["instructables.com/projects"],
		target: "/projects"
	}],
	name: "Projects",
	maintainers: ["wolfg1969"],
	handler,
	url: "instructables.com/projects",
	description: `| All | Circuits | Workshop | Craft | Cooking | Living | Outside | Teachers |
| --- | -------- | -------- | ----- | ------- | ------ | ------- | -------- |
|     | circuits | workshop | craft | cooking | living | outside | teachers |`
};
async function handler(ctx) {
	const { category = "all" } = ctx.req.param();
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 50;
	const siteDomain = "instructables.com";
	let pathPrefix, projectFilter;
	if (category === "all") {
		pathPrefix = "";
		projectFilter = "";
	} else {
		pathPrefix = `${category}/`;
		const filterValue = `${category.charAt(0).toUpperCase()}${category.slice(1)}`;
		projectFilter = category === "teachers" ? `&& teachers:=${filterValue}` : ` && category:=${filterValue}`;
	}
	const pageLink = `https://${siteDomain}/${pathPrefix}projects`;
	const $ = load(await rofetch(pageLink));
	const { typesenseProxy, typesenseApiKey } = JSON.parse($("script#js-page-context").text());
	const data = await rofetch(`${typesenseProxy}/collections/projects/documents/search`, {
		method: "get",
		baseURL: `https://${siteDomain}`,
		headers: {
			Referer: pageLink,
			Host: siteDomain,
			"x-typesense-api-key": typesenseApiKey
		},
		query: {
			q: "*",
			query_by: "title,stepBody,screenName",
			page: 1,
			per_page: limit,
			sort_by: "publishDate:desc",
			include_fields: "title,urlString,coverImageUrl,screenName,publishDate,favorites,views,primaryClassification,featureFlag,prizeLevel,IMadeItCount",
			filter_by: `featureFlag:=true${projectFilter}`
		},
		parseResponse: JSON.parse
	});
	return {
		title: "Instructables Projects",
		link: `https://${siteDomain}/projects`,
		description: "Instructables Projects",
		language: "en",
		item: data.hits.map((item) => ({
			title: item.document.title,
			link: `https://${siteDomain}/${item.document.urlString}`,
			author: item.document.screenName,
			description: `<img src="${item.document.coverImageUrl}?auto=webp&crop=1.2%3A1&frame=1&width=500" width="500">`,
			pubDate: parseDate(item.document.publishDate),
			category: item.document.primaryClassification
		}))
	};
}
//#endregion
export { route };
