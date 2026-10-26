import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
//#region lib/routes/baselang/index.ts
const ROOT_URL = "https://baselang.com";
const API_BASE = `${ROOT_URL}/wp-json/wp/v2`;
const CATEGORY_SLUG_TO_ID = {
	"advanced-grammar": 5,
	"basic-grammar": 4,
	company: 8,
	confidence: 9,
	french: 24,
	humor: 15,
	medellin: 23,
	motivation: 6,
	pronunciation: 11,
	"study-tips": 7,
	"success-stories": 14,
	travel: 13,
	uncategorized: 1,
	vocabulary: 12
};
const route = {
	path: "/blog/:category?",
	categories: ["blog"],
	example: "/baselang/blog",
	parameters: { category: {
		description: "Optional category filter",
		options: Object.keys(CATEGORY_SLUG_TO_ID).map((slug) => ({
			label: slug,
			value: slug
		}))
	} },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["baselang.com/blog", "baselang.com/blog/:category"],
		target: "/blog/:category"
	}],
	name: "Blog",
	maintainers: ["johan456789"],
	handler
};
async function handler(ctx) {
	const categoryParam = (ctx.req.param("category") ?? "").toLowerCase();
	logger.debug(`BaseLang: received request, category='${categoryParam || "all"}'`);
	if (categoryParam && !Object.hasOwn(CATEGORY_SLUG_TO_ID, categoryParam)) {
		logger.debug(`BaseLang: invalid category '${categoryParam}'`);
		throw new InvalidParameterError(`Invalid category: ${categoryParam}. Valid categories are: ${Object.keys(CATEGORY_SLUG_TO_ID).join(", ")}`);
	}
	const searchParams = ["per_page=20", "_embed=author,wp:term"];
	if (categoryParam) {
		const id = CATEGORY_SLUG_TO_ID[categoryParam];
		searchParams.push(`categories=${id}`);
	}
	const data = await rofetch(`${API_BASE}/posts?${searchParams.join("&")}`);
	logger.debug(`BaseLang: fetched ${data.length} posts`);
	const items = data.map((post) => ({
		title: post.title?.rendered,
		description: post.content?.rendered ?? post.excerpt?.rendered ?? "",
		link: post.link,
		pubDate: parseDate(post.date_gmt ?? post.date),
		author: post._embedded?.author?.[0]?.name,
		category: Array.isArray(post._embedded?.["wp:term"]) ? post._embedded["wp:term"].flat().map((term) => term?.name).filter(Boolean) : void 0
	}));
	const titleSuffix = categoryParam ? ` - ${categoryParam}` : "";
	const link = categoryParam ? `${ROOT_URL}/blog/${categoryParam}/` : `${ROOT_URL}/blog/`;
	return {
		title: `BaseLang Blog${titleSuffix}`,
		link,
		language: "en",
		item: items
	};
}
//#endregion
export { route };
