import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/pencilnews/index.ts
const route = {
	path: "/",
	categories: ["new-media"],
	example: "/pencilnews",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "文章列表",
	maintainers: ["defp"],
	handler,
	description: "获取铅笔道最新文章"
};
async function handler() {
	const baseUrl = "https://www.pencilnews.cn";
	const { data: { articles } } = (await got_default("https://api.pencilnews.cn/articles", { searchParams: {
		page: 0,
		page_size: 20
	} })).data;
	return {
		title: "铅笔道",
		link: baseUrl,
		item: await Promise.all(articles.map((article) => {
			const info = article.article_info;
			const articleId = info.article_id;
			const link = `${baseUrl}/p/${articleId}.html`;
			return cache_default.tryGet(link, async () => {
				const content = load((await got_default(link)).data)(".article_content").html();
				return {
					title: info.title,
					description: content,
					link,
					author: article.author?.profile?.name || "",
					pubDate: parseDate(info.create_at, "YYYY-MM-DD HH:mm:ss"),
					category: [],
					guid: articleId
				};
			});
		}))
	};
}
//#endregion
export { route };
