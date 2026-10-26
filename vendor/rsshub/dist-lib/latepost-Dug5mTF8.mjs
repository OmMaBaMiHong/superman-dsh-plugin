import { n as parseRelativeDate, t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/latepost/index.ts
/**
* Convert an array into a dictionary object.
* The keys of the dictionary object are the `id` properties of the elements in the array,
* and the values are the remaining properties of each element.
* @param {Array} arr - The array to be converted.
* @returns {Object} - The converted dictionary object.
*/
const arrayToDictionary = (arr) => Object.fromEntries(arr.map(({ id, ...rest }) => [id, { ...rest }]));
const route = {
	path: "/:proma?",
	categories: ["new-media"],
	example: "/latepost",
	parameters: { proma: "栏目 id，见下表，默认为最新报道" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "报道",
	maintainers: ["nczitzk"],
	handler,
	description: `| 最新报道 | 晚点独家 | 人物访谈 | 晚点早知道 | 长报道 |
| -------- | -------- | -------- | ---------- | ------ |
|          | 1        | 2        | 3          | 4      |`
};
async function handler(ctx) {
	const proma = ctx.req.param("proma");
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 5;
	const title = "晚点";
	const defaultTitle = "最新报道";
	const exclusiveCategory = "晚点独家";
	const rootUrl = "https://www.latepost.com";
	const currentUrl = new URL(proma ? `news/index?proma=${proma}` : "", rootUrl).href;
	const apiColumnUrl = new URL("site/get-column", rootUrl).href;
	const apiCommentUrl = new URL("news/get-comment", rootUrl).href;
	const apiUrl = new URL(proma ? "news/get-news-data" : "site/index", rootUrl).href;
	const { data: columnResponse } = await got_default(apiColumnUrl);
	const columns = arrayToDictionary(columnResponse?.data ?? []);
	const { data: response } = await got_default.post(apiUrl, { form: {
		page: 1,
		limit,
		programa: Number(proma)
	} });
	let items = response.data.slice(0, limit).map((item) => ({
		title: item.title,
		link: new URL(item.detail_url, rootUrl).href,
		category: [
			item.is_dj ? exclusiveCategory : void 0,
			item.programa ? columns[item.programa]?.title : void 0,
			...item.label.map((c) => c.label)
		],
		guid: item.id,
		pubDate: parseDate(item.release_time, ["MM月DD日", "YYYY年MM月DD日"])
	}));
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: detailResponse } = await got_default(item.link);
		const { data: commentResponse } = await got_default.post(apiCommentUrl, {
			news_id: item.guid,
			page: 1,
			limit: Infinity,
			sort: 1,
			delete_num: 0
		});
		const content = load(detailResponse);
		item.title ??= content("div.article-header-title").text();
		item.description = content("#select-main").html().replaceAll("<p><br></p>", "");
		item.author = content("div.article-header-author div.author-link a.label").first().text();
		item.category = item.category.filter(Boolean);
		item.guid = `latepost-${item.guid}`;
		const pubDate = content("div.article-header-date").text();
		if (pubDate) item.pubDate = /\d+月\d+日/.test(pubDate) ? parseDate(pubDate, ["YYYY年MM月DD日 HH:mm", "MM月DD日 HH:mm"]) : parseRelativeDate(pubDate);
		item.pubDate = timezone(item.pubDate, 8);
		item.comments = commentResponse.data?.length() ?? 0;
		return item;
	})));
	const icon = new URL("favicon.ico", rootUrl).href;
	const { data: currentResponse } = await got_default(currentUrl);
	const $ = load(currentResponse);
	return {
		item: items,
		title: `${title} - ${proma ? columns[proma].title : defaultTitle}`,
		link: currentUrl,
		description: $("div.logo-txt").first().text(),
		language: "zh-cn",
		image: new URL($("div.logo-txt img").prop("src"), rootUrl).href,
		icon,
		logo: icon,
		author: title
	};
}
//#endregion
export { route };
