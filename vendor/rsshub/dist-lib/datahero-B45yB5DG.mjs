import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/dtcj/datahero.ts
const titles = {
	5: "侠创",
	6: "纽约数据科学学院",
	9: "RS实验所",
	10: "阿里云天池"
};
const route = {
	path: "/datahero/:category?",
	categories: ["finance"],
	example: "/dtcj/datahero",
	parameters: { category: "分类，见下表，默认为全部" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "数据侠专栏",
	maintainers: ["nczitzk"],
	handler,
	description: `| 侠创 | 纽约数据科学学院 | RS 实验所 | 阿里云天池 |
| ---- | ---------------- | --------- | ---------- |
| 5    | 6                | 9         | 10         |`
};
async function handler(ctx) {
	const category = ctx.req.param("category") ?? "";
	const currentUrl = `https://dtcj.com/api/v1/data_hero_informations?per=15&page=1&topic_id=${category}`;
	const list = (await got_default({
		method: "get",
		url: currentUrl
	})).data.data.map((item) => ({
		title: item.title,
		author: item.author,
		link: `https://dtcj.com/topic/${item.id}`,
		pubDate: parseDate(item.date)
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = load((await got_default({
			method: "get",
			url: item.link
		})).data)(".summary-3_j7Wt, .content-3mNFyi").html();
		return item;
	})));
	return {
		title: `${category ? titles[category] : "全部"} - 数据侠专栏 | DT 财经`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
