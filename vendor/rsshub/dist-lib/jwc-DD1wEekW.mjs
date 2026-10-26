import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as getPageItemAndDate } from "./utils-BoqNULgv.mjs";
import { load } from "cheerio";
//#region lib/routes/jsu/jwc.ts
const route = {
	path: "/jwc/:types?",
	categories: ["university"],
	example: "/jsu/jwc/jwdt",
	parameters: { types: "通知分类 默认为`jwtz`" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "教务处",
	maintainers: ["wenjia03"],
	handler,
	description: `| 教务通知 | 教务动态 |
| -------- | -------- |
| jwtz     | jwdt     |`
};
async function handler(ctx) {
	const baseUrl = "https://jwc.jsu.edu.cn/";
	const { types = "jwtz" } = ctx.req.param();
	const selectors = {
		jwtz: {
			category: "教务通知",
			url: "https://jwc.jsu.edu.cn/tzgg.htm"
		},
		jwdt: {
			category: "教务动态",
			url: "https://jwc.jsu.edu.cn/jwdt.htm"
		}
	};
	const $ = load((await got_default({
		method: "get",
		url: selectors[types].url
	})).data);
	const list = $("a.c135042").toArray();
	const out = await Promise.all(list.map((item) => {
		item = $(item);
		const link = new URL(item.attr("href"), baseUrl).href;
		return cache_default.tryGet(link, async () => {
			const description = await getPageItemAndDate("#vsb_content", link, "body > div.w1180.nyWrap.clearfix > div.nyRight > div > div.passage.contPsg > form > div > h1", "body > div.w1180.nyWrap.clearfix > div.nyRight > div > div.passage.contPsg > form > div > div:nth-child(2)", (date) => date.split("\xA0\xA0\xA0\xA0\xA0文章来源：", 1)[0].split("添加时间：", 2)[1]);
			const category = selectors[types].category;
			const pubDate = parseDate(description.date, "YYYY年MM月DD日");
			return {
				title: description.title,
				link,
				pubDate,
				description: description.pageInfo,
				category
			};
		});
	}));
	return {
		title: `吉首大学教务处 - ${selectors[types].category}`,
		link: selectors[types].url,
		description: `吉首大学教务处 - ${selectors[types].category}`,
		item: out
	};
}
//#endregion
export { route };
