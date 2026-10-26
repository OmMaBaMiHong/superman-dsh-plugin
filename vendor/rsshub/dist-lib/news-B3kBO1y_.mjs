import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { n as SUPPORTED_LANGUAGES } from "./constants-DBmi1sLX.mjs";
import * as cheerio from "cheerio";
//#region lib/routes/kurogames/wutheringwaves/utils.ts
/**
* Parse a number or a number as string.\
* **NOTE:** this may return `NaN` if the string is not a number or the value is `undefined` and no {@link fallback} is provided.
*/
const parseInteger = (value, fallback) => {
	if (typeof value === "number") return value;
	if (value === void 0) return fallback === void 0 ? NaN : fallback;
	const parsed = Number(value);
	if (fallback !== void 0 && Number.isNaN(parsed)) return fallback;
	return parsed;
};
/** Type-guard to ensure {@link language} is a valid value of {@link SUPPORTED_LANGUAGES}. */
const isValidLanguage = (language) => SUPPORTED_LANGUAGES.includes(language);
/** Fetch the articles for a given language in a given category. */
const fetchArticles = async (language) => {
	if (language === "zh") return rofetch("https://media-cdn-mingchao.kurogame.com/akiwebsite/website2.0/json/G152/zh/ArticleMenu.json", { query: { t: Date.now() } });
	return (await rofetch(`https://hw-media-cdn-mingchao.kurogame.com/akiwebsite/website2.0/json/G152/${language}/MainMenu.json`)).article;
};
/** Get the link to the article content. */
const getArticleContentLink = (language, articleId) => {
	if (language === "zh") return `https://media-cdn-mingchao.kurogame.com/akiwebsite/website2.0/json/G152/zh/article/${articleId}.json`;
	return `https://hw-media-cdn-mingchao.kurogame.com/akiwebsite/website2.0/json/G152/${language}/article/${articleId}.json`;
};
/** Get the link to an article from its ID. */
const getArticleLink = (language, articleId) => {
	if (language === "zh") return `https://mc.kurogames.com/main/news/detail/${articleId}`;
	return `https://wutheringwaves.kurogames.com/${language}/main/news/detail/${articleId}`;
};
/** Resolve the handler language from the {@link Language}. */
const getHandlerLanguage = (language) => {
	switch (language) {
		case "en": return "en";
		case "zh": return "zh-CN";
		case "zh-tw": return "zh-TW";
		case "fr": return "fr";
		case "de": return "de";
		case "jp": return "ja";
		case "kr": return "ko";
		case "es": return "es";
		default: throw new Error(`Could not resolve handler language from "${language}"`);
	}
};
//#endregion
//#region lib/routes/kurogames/wutheringwaves/news.ts
const route = {
	path: `/wutheringwaves/news/:language?`,
	categories: ["game"],
	example: "/kurogames/wutheringwaves/news",
	parameters: { ["language"]: "The language to use for the content. Default: `zh`." },
	name: "鸣潮 — 游戏公告、新闻与活动",
	radar: [{ source: ["mc.kurogames.com/m/main/news", "mc.kurogames.com/main"] }, {
		title: "Wuthering Waves — Game announcements, news and events",
		source: ["wutheringwaves.kurogames.com/en/main/news", "wutheringwaves.kurogames.com/en/main"]
	}],
	maintainers: ["goestav", "enpitsulin"],
	description: `
Language codes for the \`language\` parameter:

| Language | Code         |
|----------|--------------|
| English  | en           |
| 日本語    | jp           |
| 한국어     | kr           |
| 简体中文   | zh (default) |
| 繁體中文   | zh-tw        |
| Español  | es           |
| Français | fr           |
| Deutsch  | de           |
    `,
	async handler(ctx) {
		const limitParam = ctx.req.query("limit");
		const languageParam = ctx.req.param("language");
		const limit = parseInteger(limitParam, 30);
		const language = languageParam || "zh";
		if (!isValidLanguage(language)) throw new TypeError(`Language parameter is not valid. Please use one of the following: ${SUPPORTED_LANGUAGES.join(", ")}`);
		const filteredArticles = (await fetchArticles(language)).filter((a) => a.articleType !== 0).slice(0, limit);
		const item = await Promise.all(filteredArticles.map((article) => {
			const contentUrl = getArticleContentLink(language, article.articleId);
			const item = {
				title: article.articleTitle,
				pubDate: timezone(parseDate(article.createTime), 8),
				link: getArticleLink(language, article.articleId)
			};
			return cache_default.tryGet(`wutheringwaves:${language}:${article.articleId}`, async () => {
				const articleContent = (await rofetch(contentUrl, { query: { t: Date.now() } })).articleContent ?? "";
				const $ = cheerio.load(articleContent);
				item.description = $.html() ?? article.articleDesc ?? "";
				return item;
			});
		}));
		return {
			title: language === "zh" ? "《鸣潮》— 游戏公告、新闻和活动" : "Wuthering Waves - Announcements, News and Events",
			link: language === "zh" ? "https://mc.kurogames.com/main#news" : `https://wutheringwaves.kurogames.com/${language}/main/#news`,
			item,
			language: getHandlerLanguage(language)
		};
	}
};
//#endregion
export { route };
