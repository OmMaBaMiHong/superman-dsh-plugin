import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import markdownit from "markdown-it";
//#region lib/routes/deadbydaylight/index.ts
const md = markdownit({
	html: true,
	linkify: true
});
const baseUrl = "https://deadbydaylight.com";
const route = {
	path: "/blog",
	categories: ["game"],
	example: "/deadbydaylight/blog",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["deadbydaylight.com/news"],
		target: "/news"
	}],
	name: "Latest News",
	maintainers: ["NeverBehave"],
	handler
};
async function handler() {
	const articleMeta = (await rofetch(`${baseUrl}/page-data/news/page-data.json`)).result.pageContext.postsData.articles.edges;
	return {
		title: "Latest News",
		link: "https://deadbydaylight.com/news",
		item: await Promise.all(Object.values(articleMeta).map((edge) => {
			const slug = edge.node.slug;
			const dataUrl = `${baseUrl}/page-data/news/${slug}/page-data.json`;
			return cache_default.tryGet(dataUrl, async () => {
				const articleData = await rofetch(dataUrl);
				const pageData = articleData.result.data.pageData;
				return {
					title: pageData.title,
					link: `${baseUrl}${articleData.path}`,
					description: md.render(pageData.content),
					pubDate: parseDate(pageData.published_at),
					category: pageData.article_category.name
				};
			});
		}))
	};
}
//#endregion
export { route };
