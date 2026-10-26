import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
//#region lib/routes/foodtalks/namespace.ts
const namespace = {
	name: "FoodTalks全球食品资讯网",
	url: "www.foodtalks.cn",
	categories: ["new-media"],
	lang: "zh-CN",
	description: "FoodTalks 全球食品资讯网是一个提供食品饮料行业新闻、资讯、分析和商业资源的领先在线平台。它涵盖行业趋势、市场动态、产品创新、投融资信息以及企业新闻，连接行业内的专业人士、企业和消费者。"
};
//#endregion
//#region lib/routes/foodtalks/utils.ts
const apiBaseUrl = "https://api-we.foodtalks.cn";
const baseUrl = "https://www.foodtalks.cn";
const parseList = (records) => records.map((item) => ({
	title: item.title,
	pubDate: timezone(parseDate(item.publishTime), 8),
	link: `${baseUrl}/news/${item.id}`,
	category: [item.parentTagCode === "category" ? item.tagCode : item.parentTagCode, ...item.seoKeywords.split(",")].filter(Boolean),
	author: item.author || item.sourceName,
	id: item.id,
	image: item.coverImg
}));
const processItems = (list) => Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
	item.description = (await rofetch(`${apiBaseUrl}/news/news/${item.id}?language=ZH`, { headers: { referer: `${baseUrl}/` } })).data.content;
	return item;
})));
//#endregion
export { namespace as a, processItems as i, baseUrl as n, parseList as r, apiBaseUrl as t };
