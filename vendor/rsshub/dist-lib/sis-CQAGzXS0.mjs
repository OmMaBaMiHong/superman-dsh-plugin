import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/zju/sis/index.ts
const base = "http://www.sis.zju.edu.cn/sischinese/";
/**
* Map of category types to their corresponding IDs and titles
* Used to generate URLs and titles for different news categories
*/
const categoryMap = /* @__PURE__ */ new Map([
	[0, {
		id: "12614/list.htm",
		title: "浙江大学外国语学院-重要公告"
	}],
	[1, {
		id: "12616/list.htm",
		title: "浙江大学外国语学院-最新通知"
	}],
	[2, {
		id: "12617/list.htm",
		title: "浙江大学外国语学院-教育教学"
	}],
	[3, {
		id: "12618/list.htm",
		title: "浙江大学外国语学院-科学研究"
	}],
	[4, {
		id: "12619/list.htm",
		title: "浙江大学外国语学院-新闻动态"
	}],
	[5, {
		id: "12620/list.htm",
		title: "浙江大学外国语学院-联系我们"
	}],
	[6, {
		id: "12554/list.htm",
		title: "浙江大学外国语学院-党政管理"
	}],
	[7, {
		id: "12563/list.htm",
		title: "浙江大学外国语学院-组织人事"
	}],
	[8, {
		id: "12572/list.htm",
		title: "浙江大学外国语学院-科学研究"
	}],
	[9, {
		id: "12577/list.htm",
		title: "浙江大学外国语学院-本科教育"
	}],
	[10, {
		id: "12541/list.htm",
		title: "浙江大学外国语学院-研究生教育"
	}],
	[11, {
		id: "12542/list.htm",
		title: "浙江大学外国语学院-学生思政"
	}],
	[12, {
		id: "xyll/list.htm",
		title: "浙江大学外国语学院-校友联络"
	}],
	[13, {
		id: "12609/list.htm",
		title: "浙江大学外国语学院-对外交流"
	}]
]);
/**
* Fetches and parses news items from a specific category page
* @param categoryId - The category ID to fetch news from
* @returns Promise<DataItem[]> - Array of news items with basic information
*/
async function fetchNewsItemsByCategory(categoryId) {
	const $ = load((await got_default({
		method: "get",
		url: `${base}${categoryId}`
	})).data);
	return $(".news_list").find("li").toArray().map((item) => {
		const element = $(item);
		const href = element.find("a").attr("href");
		let title = element.find("a").attr("title");
		if (!title) title = element.find("a").text().trim();
		return {
			title,
			pubDate: parseDate(element.find(".news_meta").text()),
			link: href ? new URL(href, base).href : void 0
		};
	});
}
/**
* Enriches a news item with detailed content by fetching its full page
* @param item - The basic news item to enrich
* @param refererUrl - The referer URL to use when fetching the item details
* @returns Promise<DataItem> - The enriched news item with description, author, and full title
*/
async function enrichNewsItemWithDetails(item, refererUrl) {
	if (!item.link) return item;
	return await cache_default.tryGet(item.link, async () => {
		try {
			const $ = load((await got_default({
				method: "get",
				url: item.link,
				headers: { Referer: refererUrl }
			})).data);
			const description = $(".wp_articlecontent").html();
			if (description) item.description = description;
			let author = $(".arti_metas").find(".arti_publisher").text();
			author = author.replace("发布者：", "").trim();
			if (author) item.author = author;
			return item;
		} catch {
			return item;
		}
	});
}
const route = {
	path: "/sis/:type",
	categories: ["university"],
	example: "/zju/sis/0",
	parameters: { type: "分类，见下表" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "外国语学院",
	description: `| 重要公告 | 最新通知 | 教育教学 | 科学研究 | 新闻动态 | 联系我们 | 党政管理 | 组织人事 | 科学研究 | 本科教育 | 研究生教育 | 学生思政 | 校友联络 | 对外交流 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | ---------- | -------- | -------- | -------- |
| 0        | 1        | 2        | 3        | 4        | 5        | 6        | 7        | 8        | 9        | 10         | 11       | 12       | 13       |`,
	maintainers: ["Alex222222222222"],
	handler: handleSisRequest,
	url: "www.sis.zju.edu.cn"
};
/**
* Main handler function for processing SIS (School of International Studies) news requests
* @param ctx - The request context containing route parameters
* @returns Promise with RSS feed data including title, link, and news items
*/
async function handleSisRequest(ctx) {
	const requestedType = Number.parseInt(ctx.req.param("type"));
	const categoryInfo = categoryMap.get(requestedType);
	if (!categoryInfo) {
		const validTypes = categoryMap.keys().toArray().join(", ");
		throw new Error(`Invalid type: ${requestedType}. Valid types are: ${validTypes}`);
	}
	const categoryUrl = `${base}${categoryInfo.id}`;
	const allNewsItems = await fetchNewsItemsByCategory(categoryInfo.id);
	const enrichedItems = await Promise.all(allNewsItems.map((item) => enrichNewsItemWithDetails(item, categoryUrl)));
	return {
		title: categoryInfo.title,
		link: categoryUrl,
		item: enrichedItems
	};
}
//#endregion
export { route };
