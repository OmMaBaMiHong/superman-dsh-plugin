import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/samd/news.ts
const dict = {
	"434": "行业资讯",
	"436": "协会动态",
	"438": "重要通知",
	"440": "政策法规"
};
const route = {
	path: "/news/:typeId",
	categories: ["government"],
	example: "/samd/news/440",
	parameters: { type: "文章类型ID，见下表" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	description: `| 行业资讯 | 协会动态 | 重要通知 | 政策法规 |
| -------- | -------- | -------- | -------- |
| 434      | 436      | 438      | 440      |`,
	name: "资讯信息",
	maintainers: ["hualiong"],
	handler: async (ctx) => {
		const baseURL = "https://www.samd.org.cn/home";
		const typeId = ctx.req.param("typeId");
		const { rows } = await rofetch("/GetNewsByTagId", {
			baseURL,
			method: "POST",
			query: {
				page: 1,
				rows: 10,
				typeId,
				status: 1
			}
		});
		const list = rows.map((row) => ({
			title: row.title,
			category: [row.tag_names],
			link: `${baseURL}/newsDetail?id=${row.auto_id}&typeId=${typeId}`,
			image: row.img_url ? baseURL + row.img_url : null
		}));
		const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const content = load(await rofetch(item.link))(".content");
			item.author = content.find(".author span").text();
			item.pubDate = timezone(parseDate(content.find(".time").text(), "发布时间：YYYY-MM-DD HH:mm:ss"), 8);
			content.children(".titles").remove();
			content.children(".auxi").remove();
			item.description = content.html();
			return item;
		})));
		return {
			title: `${dict[typeId]} - 深圳市医疗器械行业协会`,
			link: "https://www.samd.org.cn/home/newsList",
			item: items
		};
	}
};
//#endregion
export { route };
