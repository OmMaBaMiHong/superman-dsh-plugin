import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/backlinko/blog.ts
const route = {
	path: "/blog",
	categories: ["blog"],
	example: "/backlinko/blog",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["backlinko.com/blog", "backlinko.com/"] }],
	name: "Blog",
	maintainers: ["TonyRL"],
	handler,
	url: "backlinko.com/blog"
};
async function handler() {
	const baseUrl = "https://backlinko.com";
	const { data: response, url: link } = await got_default(`${baseUrl}/blog`);
	const $ = load(response);
	const { buildId, props: { pageProps } } = JSON.parse($("#__NEXT_DATA__").text());
	const posts = [...pageProps.posts.nodes, ...pageProps.backlinkoLockedPosts.nodes].map((post) => ({
		title: post.title,
		link: `${baseUrl}/${post.slug}`,
		pubDate: parseDate(post.modified),
		author: post.author.node.name,
		apiUrl: `${baseUrl}/_next/data/${buildId}/${post.slug}.json`
	}));
	const items = await Promise.all(posts.map((item) => cache_default.tryGet(item.link, async () => {
		const { data } = await got_default(item.apiUrl);
		item.description = (data.pageProps.post || data.pageProps.lockedPost).content;
		return item;
	})));
	return {
		title: pageProps.page.seo.title,
		description: pageProps.page.seo.metaDesc,
		link,
		language: "en",
		item: items
	};
}
//#endregion
export { route };
