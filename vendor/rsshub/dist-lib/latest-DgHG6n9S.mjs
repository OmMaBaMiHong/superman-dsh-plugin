import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { n as assetsConnectionByCriteriaQuery, t as getItem } from "./utils-BRG2RB8y.mjs";
//#region lib/routes/afr/latest.ts
const route = {
	path: "/latest",
	categories: ["traditional-media"],
	example: "/afr/latest",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.afr.com/latest", "www.afr.com/"] }],
	name: "Latest",
	maintainers: ["TonyRL"],
	handler,
	url: "www.afr.com/latest"
};
async function handler(ctx) {
	const list = (await rofetch("https://api.afr.com/graphql", { query: {
		query: assetsConnectionByCriteriaQuery,
		operationName: "assetsConnectionByCriteria",
		variables: {
			brand: "afr",
			first: Number.parseInt(ctx.req.query("limit") ?? "10"),
			render: "web",
			types: [
				"article",
				"bespoke",
				"featureArticle",
				"liveArticle",
				"video"
			],
			after: ""
		}
	} })).data.assetsConnectionByCriteria.edges.map(({ node }) => ({
		title: node.asset.headlines.headline,
		description: node.asset.about,
		link: `https://www.afr.com${node.urls.published.afr.path}`,
		pubDate: parseDate(node.dates.firstPublished),
		updated: parseDate(node.dates.modified),
		author: node.asset.byline,
		category: [node.tags.primary.displayName, ...node.tags.secondary.map((tag) => tag.displayName)],
		image: node.featuredImages && `https://static.ffx.io/images/${node.featuredImages.landscape16x9.data.id}`
	}));
	return {
		title: "Latest | The Australian Financial Review | AFR",
		description: "The latest news, events, analysis and opinion from The Australian Financial Review",
		image: "https://www.afr.com/apple-touch-icon-1024x1024.png",
		link: "https://www.afr.com/latest",
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, () => getItem(item))))
	};
}
//#endregion
export { route };
