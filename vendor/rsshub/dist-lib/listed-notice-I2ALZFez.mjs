import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/szse/disclosure/listed-notice.ts
function isValidDate(dateString) {
	if (!/^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/.test(dateString)) return false;
	const [year, month, day] = dateString.split("-").map(Number);
	const date = new Date(year, month - 1, day);
	return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}
const handler = async (ctx) => {
	const { category = "" } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "50");
	const query = ctx.req.param("query") ?? "";
	const queries = {
		stock: "",
		beginDate: "",
		endDate: ""
	};
	if (query) for (const pair of query.split("&")) {
		const [key, value] = pair.split("=");
		if (key) queries[key] = value;
	}
	if (queries.beginDate && !isValidDate(queries.beginDate)) throw new Error("Invalid beginDate format. Expected YYYY-MM-DD");
	if (queries.endDate) {
		if (!isValidDate(queries.endDate)) throw new Error("Invalid endDate format. Expected YYYY-MM-DD");
	} else if (queries.beginDate) queries.endDate = queries.beginDate;
	const baseUrl = "https://www.szse.cn";
	const staticBaseUrl = "https://disc.static.szse.cn";
	const apiUrl = new URL("api/disc/announcement/annList", baseUrl).href;
	const targetUrl = new URL(`disclosure/listed/notice${category}`, baseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "zh-CN";
	const items = (await rofetch(apiUrl, {
		method: "POST",
		body: {
			stock: queries.stock ? [queries.stock] : [],
			seDate: [queries.beginDate, queries.endDate],
			channelCode: ["listedNotice_disc"],
			pageSize: limit,
			pageNum: 1
		}
	})).data.slice(0, limit).map((item) => {
		const title = item.title;
		const pubDate = item.publishTime;
		const linkUrl = `disclosure/listed/bulletinDetail/index.html?${item.id}`;
		const categories = [...new Set([
			...item.secCode,
			...item.secName,
			item.bigCategoryId,
			item.bigIndustryCode,
			item.smallCategoryId
		].filter(Boolean))];
		const guid = `szse-${item.id}`;
		const updated = item.publishTime;
		let processedItem = {
			title,
			pubDate: pubDate ? timezone(parseDate(pubDate), 8) : void 0,
			link: new URL(linkUrl, baseUrl).href,
			category: categories,
			guid,
			id: guid,
			updated: updated ? timezone(parseDate(updated), 8) : void 0,
			language
		};
		const enclosureUrl = new URL(`download${item.attachPath}`, staticBaseUrl).href;
		if (enclosureUrl) {
			const enclosureType = `application/${item.attachFormat}`;
			processedItem = {
				...processedItem,
				enclosure_url: enclosureUrl,
				enclosure_type: enclosureType,
				enclosure_title: title,
				enclosure_length: void 0
			};
		}
		return processedItem;
	}).filter((_) => true);
	return {
		title: "深圳证券交易所 - 上市公司公告",
		description: $("meta[name=\"description\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("a.navbar-brand img").attr("src"),
		author: $("meta[name=\"author\"]").attr("content"),
		language,
		id: targetUrl
	};
};
const route = {
	path: "/disclosure/listed/notice/:query?",
	name: "上市公司公告",
	url: "www.szse.cn",
	maintainers: ["nczitzk"],
	handler,
	example: "/szse/disclosure/listed/notice",
	parameters: { query: "Filter options. can filte by \"stock\",\"beginDate\",\"endDate\". example:\"stock=000001&beginDate=2025-07-01&endDate=2025-08-30\"" },
	description: void 0,
	categories: ["finance"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportRadar: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["www.szse.cn/disclosure/listed/notice/index.html"],
		target: "/disclosure/listed/notice"
	}],
	view: 0
};
//#endregion
export { handler, route };
