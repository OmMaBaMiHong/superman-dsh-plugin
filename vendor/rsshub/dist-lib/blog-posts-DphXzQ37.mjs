import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/konghq/blog-posts.ts
const BASE_URL = "https://konghq.com";
const BLOG_POSTS_URL = `${BASE_URL}/blog`;
const route = {
	path: "/blog-posts",
	categories: ["programming"],
	example: "/konghq/blog-posts",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["konghq.com/blog/*"] }],
	name: "博客最新文章",
	maintainers: ["piglei"],
	handler,
	url: "konghq.com/blog/*"
};
async function handler() {
	const { data: response } = await got_default(`${BLOG_POSTS_URL}/page/1`);
	const $ = load(response);
	const posts = JSON.parse($("#__NEXT_DATA__").text()).props.pageProps.cardsPaged.cards.map((item) => {
		const title = item.title;
		const author = item.authors.map((author) => author.title).join(", ");
		const category = item.term.title;
		return {
			title,
			link: `${BASE_URL}${item.link.href}`,
			pubDate: parseDate(item.publishedAt),
			author,
			category
		};
	});
	const items = await Promise.all(posts.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: response } = await got_default(item.link);
		item.description = load(response)("section[class^=\"blog_sections\"]").first().html();
		return item;
	})));
	return {
		title: "Kong Inc(konghq.com) blog posts",
		link: BLOG_POSTS_URL,
		item: items
	};
}
//#endregion
export { route };
