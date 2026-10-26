import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
//#region lib/routes/eastmoney/search/index.ts
const route = {
	path: "/search/:keyword",
	categories: ["finance"],
	view: 0,
	example: "/eastmoney/search/web3",
	parameters: { keyword: "关键词，可以设置为自己需要检索的关键词" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "搜索",
	maintainers: ["drgnchan"],
	handler
};
async function handler(ctx) {
	const keyword = ctx.req.param("keyword");
	const link = `https://so.eastmoney.com/News/s?KeyWord=${keyword}`;
	const body = {
		uid: "",
		keyword,
		type: ["cmsArticleWebOld"],
		client: "web",
		clientType: "web",
		clientVersion: "curr",
		params: { cmsArticleWebOld: {
			searchScope: "default",
			sort: "default",
			pageIndex: 1,
			pageSize: 10,
			preTag: "<em>",
			postTag: "</em>"
		} }
	};
	const extractedText = (await got_default("https://search-api-web.eastmoney.com/search/jsonp", { searchParams: {
		cb: `jQuery${("3.5.1" + Math.random()).replaceAll(/\D/g, "")}_${Date.now()}`,
		param: JSON.stringify(body)
	} })).data.match(/jQuery\d+_\d+\((.*)\)/)[1];
	const items = JSON.parse(extractedText).result.cmsArticleWebOld.map((item) => ({
		title: item.title,
		description: item.content,
		pubDate: timezone(parseDate(item.date), 8),
		link: item.url,
		author: item.mediaName
	}));
	return {
		title: `东方财富网 - 搜索'${keyword}'`,
		link,
		item: items
	};
}
//#endregion
export { route };
