import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
//#region lib/routes/englishhome/index.ts
const route = {
	path: "/",
	categories: ["blog"],
	example: "/englishhome",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["englishhome.org/"] }],
	name: "首頁",
	maintainers: ["johan456789"],
	handler,
	description: "英語之家 - The Home of English 首頁"
};
async function handler() {
	const rootUrl = "https://englishhome.org";
	return {
		title: "英語之家 - The Home of English",
		link: rootUrl,
		language: "zh-TW",
		item: (await rofetch(`${rootUrl}/wp-json/wp/v2/posts?per_page=20&_embed=author,wp:term`)).map((post) => ({
			title: post.title?.rendered,
			description: post.content?.rendered ?? post.excerpt?.rendered ?? "",
			link: post.link,
			pubDate: parseDate(post.date_gmt ?? post.date),
			author: post._embedded?.author?.[0]?.name,
			category: Array.isArray(post._embedded?.["wp:term"]) ? post._embedded["wp:term"].flat().map((term) => term?.name).filter(Boolean) : void 0
		}))
	};
}
//#endregion
export { route };
