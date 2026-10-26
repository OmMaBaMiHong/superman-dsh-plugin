import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
//#region lib/routes/trendingpapers/papers.ts
const route = {
	path: "/papers/:category?/:time?/:cited?",
	categories: ["journal"],
	example: "/trendingpapers/papers",
	parameters: {
		category: "Category of papers, can be found in URL. `All categories` by default.",
		time: "Time like `24 hours` to specify the duration of ranking, can be found in URL. `Since beginning` by default.",
		cited: "Cited or uncited papers, can be found in URL. `Cited and uncited papers` by default."
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Trending Papers on arXiv",
	maintainers: ["CookiePieWw"],
	handler
};
async function handler(ctx) {
	const { time = "Since beginning", cited = "Cited and uncited papers", category = "All categories" } = ctx.req.param();
	const currentUrl = `https://trendingpapers.com/api/papers?p=1&o=pagerank_growth&pd=${time}&cc=${cited}&c=${category}`;
	const papers = (await rofetch(currentUrl)).data.map((_) => {
		return {
			title: _.title,
			description: _.abstract,
			link: _.url,
			guid: _.arxiv_id,
			pubDate: parseDate(_.pub_date),
			category: _.summary_categories
		};
	});
	return {
		title: `Trending Papers on arXiv.org | ${category} | ${time} | ${cited} | `,
		link: currentUrl,
		item: papers
	};
}
//#endregion
export { route };
