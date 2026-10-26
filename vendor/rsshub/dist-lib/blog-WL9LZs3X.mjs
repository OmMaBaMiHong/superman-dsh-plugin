import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/stanford/blog.ts
const route = {
	path: "/hazyresearch/blog",
	categories: ["blog"],
	example: "/stanford/hazyresearch/blog",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["hazyresearch.stanford.edu/blog"] }],
	name: "Hazy Research Blog",
	maintainers: ["dvorak0"],
	handler,
	url: "hazyresearch.stanford.edu/blog"
};
async function handler() {
	const baseUrl = "https://hazyresearch.stanford.edu";
	const currentUrl = `${baseUrl}/blog`;
	const { data: response } = await got_default(currentUrl);
	const nextDataRaw = load(response)("script#__NEXT_DATA__").text();
	const nextData = JSON.parse(nextDataRaw);
	const posts = nextData.props.pageProps.posts || [];
	const buildId = nextData.buildId;
	const list = posts.map((post) => ({
		title: post.title,
		link: `${baseUrl}/blog/${post.slug}`,
		api: `${baseUrl}/_next/data/${buildId}/blog/${post.slug}.json`,
		author: post.author,
		pubDate: timezone(parseDate(post.dateString, "MMM D, YYYY"), -7)
	}));
	return {
		title: "Hazy Research Blog",
		link: currentUrl,
		description: "Research updates from Stanford Hazy Research",
		language: "en",
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const { data: html } = await got_default(item.link);
			item.description = load(html)("main [class^=\"Post_content\"]").html() || "";
			return item;
		})))
	};
}
//#endregion
export { route };
