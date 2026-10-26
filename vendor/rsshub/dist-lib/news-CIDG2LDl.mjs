import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/scpta/news.ts
const route = {
	path: "/news/:category",
	categories: ["government"],
	example: "/scpta/news/33",
	parameters: { category: {
		description: "分类ID，默认为`33`(工作动态)",
		default: "33"
	} },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["www.scpta.com.cn/front/News/List"],
		target: "/news"
	}],
	name: "通知公告",
	maintainers: ["Yeye-0426"],
	handler,
	description: `| 分类                 | category\\_id |
| -------------------- | ------------ |
| 工作动态             | 33           |
| 公务员考试           | 56           |
| 专业技术人员资格考试 | 57           |
| 事业单位考试         | 67           |
| 其它                 | 72           |`
};
async function handler(ctx) {
	const category = ctx.req.param("category");
	const baseUrl = "https://www.scpta.com.cn";
	const url = `${baseUrl}/front/News/List/${category}`;
	const $ = load((await got_default(url)).data);
	const list = $("div.wrap-content li").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find("a").attr("title"),
			link: `${baseUrl}${item.find("a").attr("href")}`,
			pubDate: parseDate(item.find("span").text().trim())
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		let description;
		try {
			description = load((await got_default(item.link)).data)("div.wrap-content.news-content").html();
		} catch {
			description = "公告内容获取失败";
		}
		item.description = description;
		return item;
	})));
	return {
		title: `通知公告 - ${{
			"33": "工作动态",
			"56": "公务员考试",
			"57": "专业技术人员资格考试",
			"67": "事业单位考试",
			"72": "其它"
		}[category] || "未知分类"}`,
		link: url,
		item: items
	};
}
//#endregion
export { route };
