import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/anquanke/category.ts
const route = {
	path: "/:category/:fulltext?",
	categories: ["programming"],
	example: "/anquanke/week",
	parameters: {
		category: "分类订阅",
		fulltext: "是否获取全文，如需获取全文参数传入 `quanwen` 或 `fulltext`"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "分类订阅",
	maintainers: ["qwertyuiop6"],
	handler,
	description: `| 360 网络安全周报 | 活动     | 知识      | 资讯 | 招聘 | 工具 |
| ---------------- | -------- | --------- | ---- | ---- | ---- |
| week             | activity | knowledge | news | job  | tool |`
};
async function handler(ctx) {
	const api = "https://api.anquanke.com/data/v1/posts?size=10&page=1&category=";
	const type = ctx.req.param("category");
	const fulltext = ctx.req.param("fulltext");
	const host = "https://www.anquanke.com";
	const dataArray = (await got_default(`${api}${type}`)).data.data;
	const items = await Promise.all(dataArray.map(async (item) => {
		const art_url = `${host}/${type === "week" ? "week" : "post"}/id/${item.id}`;
		return {
			title: item.title,
			description: fulltext === "fulltext" || fulltext === "quanwen" ? await cache_default.tryGet(art_url, async () => {
				const { data: res } = await got_default(art_url);
				return load(res)("#js-article").html();
			}) : item.desc,
			pubDate: timezone(parseDate(item.date), 8),
			link: art_url,
			author: item.author.nickname
		};
	}));
	return {
		title: `安全客-${dataArray[0].category_name}`,
		link: `https://www.anquanke.com/${type === "week" ? "week-list" : type}`,
		item: items
	};
}
//#endregion
export { route };
