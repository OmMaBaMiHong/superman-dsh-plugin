import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as getAcwScV2ByArg1 } from "./utils-BiyO2GgI2.mjs";
//#region lib/routes/techflowpost/utils.ts
const rootUrl = "https://www.techflowpost.com";
const apiRootUrl = `${rootUrl}/api`;
const uploadRootUrl = "https://upload.techflowpost.com";
const locale = "zh-CN";
let acwScV2Cookie = "";
function getHeaders(referer, cookie = acwScV2Cookie) {
	return {
		accept: "application/json, text/plain, */*",
		"accept-language": locale,
		referer,
		"user-agent": config.trueUA,
		...cookie && { cookie }
	};
}
function getAcwScV2Cookie(response) {
	const arg1 = response.match(/var arg1='(.*?)';/)?.[1];
	if (!arg1) return "";
	return `acw_sc__v2=${getAcwScV2ByArg1(arg1)}`;
}
async function requestApi(endpoint, referer, searchParams) {
	const request = () => got_default.get(`${apiRootUrl}${endpoint}`, {
		searchParams,
		headers: getHeaders(referer)
	});
	const { data } = await request();
	if (typeof data !== "string") return data;
	const cookie = getAcwScV2Cookie(data);
	if (!cookie) throw new Error("TechFlow API returned an unexpected non-JSON response.");
	acwScV2Cookie = cookie;
	const retryResponse = await request();
	if (typeof retryResponse.data === "string") throw new TypeError("TechFlow API still returned an anti-crawler challenge after retry.");
	return retryResponse.data;
}
function getPictureUrl(picture) {
	if (!picture) return;
	return new URL(picture, uploadRootUrl).href;
}
function getCategories(article) {
	return [...new Set([article.category?.name, ...article.labels?.map((label) => label.label) ?? []].filter(Boolean))];
}
function getArticleItem(article, content) {
	const link = `${rootUrl}/${locale}/article/${article.id}`;
	const categories = getCategories(article);
	const image = getPictureUrl(article.picture);
	return {
		title: article.title,
		author: article.author?.name,
		link,
		category: categories.length ? categories : void 0,
		pubDate: article.created_at ? parseDate(article.created_at) : void 0,
		updated: article.updated_at ? parseDate(article.updated_at) : void 0,
		description: content || article.abstract,
		image
	};
}
function getNewsflashItem(newsflash, content) {
	return {
		title: newsflash.title,
		link: `${rootUrl}/${locale}/newsletter/${newsflash.id}`,
		pubDate: newsflash.created_at ? parseDate(newsflash.created_at) : void 0,
		updated: newsflash.updated_at ? parseDate(newsflash.updated_at) : void 0,
		description: content || newsflash.abstract
	};
}
async function getArticleItems({ category, limit }) {
	const link = `${rootUrl}/${locale}/article`;
	const searchParams = {
		page: 1,
		page_size: limit
	};
	if (category) searchParams.category_id = category;
	const response = await requestApi("/client/articles", link, searchParams);
	if (!Array.isArray(response.data)) throw new TypeError("TechFlow API returned an invalid article list.");
	return await Promise.all(response.data.map((article) => cache_default.tryGet(`techflowpost:article:${article.id}`, async () => {
		const itemLink = `${rootUrl}/${locale}/article/${article.id}`;
		return getArticleItem(article, (await requestApi(`/client/articles/${article.id}`, itemLink)).article?.content);
	})));
}
async function getNewsflashItems(limit) {
	const response = await requestApi("/client/newsflashes", `${rootUrl}/${locale}/newsletter`, {
		page: 1,
		page_size: limit
	});
	if (!Array.isArray(response.data)) throw new TypeError("TechFlow API returned an invalid newsflash list.");
	return await Promise.all(response.data.map((newsflash) => cache_default.tryGet(`techflowpost:newsflash:${newsflash.id}`, async () => {
		const itemLink = `${rootUrl}/${locale}/newsletter/${newsflash.id}`;
		return getNewsflashItem(newsflash, (await requestApi(`/client/newsflashes/${newsflash.id}`, itemLink)).content);
	})));
}
//#endregion
export { getNewsflashItems as n, rootUrl as r, getArticleItems as t };
