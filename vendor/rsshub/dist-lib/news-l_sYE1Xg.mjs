import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import * as cheerio from "cheerio";
//#region lib/routes/deepseek/news.ts
const ROOT_URL = "https://api-docs.deepseek.com/zh-cn";
const NEWS_LIST_SELECTOR = "ul.menu__list > li:nth-child(2) ul > li.theme-doc-sidebar-item-link";
const ARTICLE_CONTENT_SELECTOR = ".theme-doc-markdown > div > div";
const ARTICLE_TITLE_SELECTOR = ".theme-doc-markdown > div > div > h1";
const fetchPageContent = async (url) => {
	const response = await rofetch(url);
	return cheerio.load(response);
};
const extractArticleInfo = ($article, pageURL) => {
	const contentElement = $article(ARTICLE_CONTENT_SELECTOR);
	const title = $article(ARTICLE_TITLE_SELECTOR).text();
	$article(ARTICLE_TITLE_SELECTOR).remove();
	return {
		title,
		content: contentElement.html(),
		pageURL
	};
};
const parseDateString = (dateString) => {
	return new Date(dateString).toUTCString();
};
const createDataItem = (item, $) => {
	const $item = $(item);
	const link = $item.find("a").attr("href");
	const dateString = $item.find("a").text().split(" ").at(-1);
	const pageURL = new URL(link || "", ROOT_URL).href;
	return cache_default.tryGet(pageURL, async () => {
		const $article = await fetchPageContent(pageURL);
		const { title, content } = extractArticleInfo($article, pageURL);
		const pubDate = parseDateString(dateString);
		return {
			title,
			link: pageURL,
			pubDate,
			description: content || void 0
		};
	});
};
const handler = async () => {
	const $ = await fetchPageContent(ROOT_URL);
	const newsList = $(NEWS_LIST_SELECTOR);
	const items = await Promise.all(newsList.toArray().map((li) => createDataItem(li, $)));
	return {
		title: "DeepSeek 新闻",
		link: ROOT_URL,
		item: items,
		allowEmpty: true
	};
};
const route = {
	path: "/news",
	categories: ["programming"],
	example: "/deepseek/news",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["api-docs.deepseek.com"],
		target: "/news"
	}],
	name: "新闻",
	maintainers: ["1837634311"],
	handler
};
//#endregion
export { route };
