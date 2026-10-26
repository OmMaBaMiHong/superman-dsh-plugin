import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { r as pageByNavigationPathQuery, t as getItem } from "./utils-BRG2RB8y.mjs";
//#region lib/routes/afr/navigation.ts
const route = {
	path: "/navigation/:path{.+}",
	categories: ["traditional-media"],
	example: "/afr/navigation/markets",
	parameters: { path: "Navigation path, can be found in the URL of the page" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.afr.com/path*"] }],
	name: "Navigation",
	maintainers: ["TonyRL"],
	handler,
	url: "www.afr.com"
};
async function handler(ctx) {
	const { path } = ctx.req.param();
	const limit = Number.parseInt(ctx.req.query("limit") ?? "10");
	const response = await rofetch("https://api.afr.com/api/content-audience/afr/graphql", { query: {
		query: pageByNavigationPathQuery,
		operationName: "pageByNavigationPath",
		variables: {
			input: {
				brandKey: "afr",
				navigationPath: `/${path}`,
				renderName: "web"
			},
			firstStories: limit,
			afterStories: ""
		}
	} });
	const list = response.data.pageByNavigationPath.page.latestStoriesConnection.edges.map(({ node }) => ({
		title: node.headlines.headline,
		description: node.overview.about,
		link: `https://www.afr.com${node.urls.canonical.path}`,
		pubDate: parseDate(node.dates.firstPublished),
		updated: parseDate(node.dates.modified),
		author: node.byline.filter((byline) => byline.type === "AUTHOR").map((byline) => byline.author.name).join(", "),
		category: [node.tags.primary.displayName, ...node.tags.secondary.map((tag) => tag.displayName)],
		image: node.images && `https://static.ffx.io/images/${node.images.landscape16x9.mediaId}`
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, () => getItem(item))));
	return {
		title: response.data.pageByNavigationPath.page.seo.title,
		description: response.data.pageByNavigationPath.page.seo.description,
		image: "https://www.afr.com/apple-touch-icon-1024x1024.png",
		link: `https://www.afr.com/${path}`,
		item: items
	};
}
//#endregion
export { route };
