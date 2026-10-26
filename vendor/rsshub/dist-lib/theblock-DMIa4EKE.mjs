import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/theblock/index.ts
const route = {
	path: "/category/:category",
	categories: ["finance"],
	example: "/theblock/category/crypto-ecosystems",
	parameters: { category: "News category" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Category",
	maintainers: ["pseudoyu"],
	handler,
	radar: [{
		source: ["theblock.co/category/:category"],
		target: "/category/:category"
	}],
	description: "Get latest news from TheBlock by category. Note that due to website limitations, only article summaries may be available."
};
async function handler(ctx) {
	const category = ctx.req.param("category");
	const limit = ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 10;
	const apiUrl = `https://www.theblock.co/api/category/${category}`;
	try {
		const articles = (await rofetch(apiUrl)).data?.articles || [];
		if (!articles.length) throw new Error(`No articles found for category: ${category}`);
		const items = await Promise.all(articles.slice(0, limit).map((article) => cache_default.tryGet(`theblock:article:${article.url}`, async () => {
			try {
				const post = (await rofetch(`https://www.theblock.co/api/post/${article.id}/`)).post;
				const $ = load(post.body, null, false);
				if (post.body.length) {
					$(".copyright").remove();
					let fullText = "";
					if (article.thumbnail) fullText += `<p><img src="${post.thumbnail}" alt="${article.title}"></p>`;
					fullText += post.intro + $.html();
					if (fullText) return {
						title: article.title,
						link: article.url,
						pubDate: parseDate(post.published),
						description: fullText,
						author: article.authors?.map((a) => a.name).join(", ") || "TheBlock",
						category: [.../* @__PURE__ */ new Set([
							post.categories.name,
							...post.categories.map((cat) => cat.name),
							...post.tags.map((tag) => tag.name)
						])],
						guid: article.url,
						image: article.thumbnail
					};
				}
				logger.info(`Using summary-based approach for article: ${article.url}`);
				return createSummaryItem(article);
			} catch (error) {
				logger.warn(`Couldn't fetch full content for ${article.url}: ${error.message}`);
				return createSummaryItem(article);
			}
		})));
		return {
			title: `TheBlock - ${category.charAt(0).toUpperCase() + category.slice(1).replaceAll("-", " ")}`,
			link: `https://www.theblock.co/category/${category}`,
			item: items,
			description: `Latest articles from TheBlock in the ${category} category`,
			language: "en"
		};
	} catch (error) {
		logger.error(`Error in TheBlock handler: ${error.message}`);
		throw error;
	}
}
function createSummaryItem(article) {
	let description = "";
	if (article.thumbnail) description += `<p><img src="${article.thumbnail}" alt="${article.title}"></p>`;
	if (article.subheading) description += `<p><strong>${article.subheading}</strong></p>`;
	if (article.preview) description += `<p>${article.preview}</p>`;
	description += `<p><a href="${article.url}">Read the full article at TheBlock</a></p>`;
	return {
		title: article.title,
		link: article.url,
		pubDate: parseDate(article.publishedFormatted, "MMMM D, YYYY, h:mmA [EST]"),
		description,
		author: article.authors?.map((a) => a.name).join(", ") || "TheBlock",
		category: article.primaryCategory?.name || [],
		guid: article.url,
		image: article.thumbnail
	};
}
//#endregion
export { route };
