import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
//#region lib/routes/cohere/index.ts
const route = {
	path: "/blog",
	name: "Blog",
	url: "cohere.com/blog",
	maintainers: ["Loongphy"],
	handler,
	example: "/cohere/blog",
	description: "Cohere is a platform for building AI applications.",
	categories: ["blog"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportRadar: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["cohere.com"] }]
};
async function handler() {
	const { posts: data } = await rofetch("https://cohere-ai.ghost.io/ghost/api/content/posts", { query: {
		key: "572d288a9364f8e4186af1d60a",
		limit: "all",
		include: ["authors", "tags"],
		filter: "tag:-hash-hidden+tag:-llmu"
	} });
	return {
		title: "The Cohere Blog",
		link: "https://cohere.com/blog",
		item: data.map((item) => ({
			title: item.title,
			link: "https://cohere.com/blog/" + item.slug,
			description: item.excerpt,
			pubDate: parseDate(item.published_at),
			author: item.authors.map((author) => author.name).join(", "),
			category: item.tags.map((tag) => tag.name)
		}))
	};
}
//#endregion
export { route };
