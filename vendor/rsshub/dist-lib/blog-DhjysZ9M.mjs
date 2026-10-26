import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
import markdownit from "markdown-it";
//#region lib/routes/apiseven/blog.ts
const md = markdownit({ html: true });
async function getArticles() {
	const { data: res } = await got_default("https://www.apiseven.com/blog");
	const $ = load(res);
	return JSON.parse($("#__NEXT_DATA__").text()).props.pageProps.list.map((item) => ({
		title: item.title,
		link: "https://www.apiseven.com" + item.slug,
		pubDate: timezone(parseDate(item.published_at), 8),
		category: item.tags
	}));
}
const route = {
	path: "/blog",
	categories: ["blog"],
	example: "/apiseven/blog",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "博客",
	maintainers: ["aneasystone"],
	handler
};
async function handler() {
	const articles = await getArticles();
	return {
		title: "博客 | 支流科技",
		link: "https://www.apiseven.com/blog",
		item: await Promise.all(articles.map((item) => cache_default.tryGet(item.link, async () => {
			const { data: res } = await got_default(item.link);
			const $ = load(res);
			const json = JSON.parse($("#__NEXT_DATA__").text());
			return {
				title: item.title,
				description: md.render(json.props.pageProps.post.content),
				link: item.link,
				pubDate: item.pubDate,
				author: json.props.pageProps.post.author_name
			};
		})))
	};
}
//#endregion
export { route };
