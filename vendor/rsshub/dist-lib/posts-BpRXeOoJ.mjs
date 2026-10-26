import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/devtrium/posts.ts
const route = {
	path: "/",
	categories: ["programming"],
	example: "/devtrium",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["devtrium.com"] }],
	name: "Official Blogs",
	maintainers: ["Xy2002"],
	handler,
	url: "devtrium.com"
};
async function handler() {
	return {
		title: "Devtrium",
		language: "en-us",
		item: await fetchPage(),
		link: "https://devtrium.com"
	};
}
async function fetchPage() {
	const baseUrl = "https://devtrium.com";
	const $ = load(await rofetch(baseUrl), { scriptingEnabled: false });
	return JSON.parse($("script#__NEXT_DATA__").text()).props.pageProps.posts.map((post) => ({
		title: post.title,
		link: `${baseUrl}/posts/${post.slug}`,
		description: post.description,
		pubDate: parseDate(post.date)
	}));
}
//#endregion
export { route };
