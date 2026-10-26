import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as joinUrl } from "./utils-2dNJ-pxp.mjs";
import { load } from "cheerio";
//#region lib/routes/swpu/dxy.ts
const route = {
	path: "/dxy/:code",
	categories: ["university"],
	example: "/swpu/dxy/1156",
	parameters: { code: "栏目代码" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["swpu.edu.cn/"],
		target: ""
	}],
	name: "电气信息学院",
	maintainers: ["CYTMWIA"],
	handler,
	url: "swpu.edu.cn/",
	description: `| 栏目 | 学院新闻 | 学院通知 |
| ---- | -------- | -------- |
| 代码 | 1122     | 1156     |`
};
async function handler(ctx) {
	const url = `https://www.swpu.edu.cn/dxy/list1.jsp?urltype=tree.TreeTempUrl&wbtreeid=${ctx.req.param("code")}`;
	const $ = load((await got_default.get(url)).data);
	let title = $("title").text();
	title = title.slice(0, title.indexOf("-"));
	const items = $("tr[height=\"20\"]").toArray().map((elem) => ({
		title: $("a[title]", elem).text().trim(),
		pubDate: timezone(parseDate($("td:eq(1)", elem).text(), "YYYY年MM月DD日"), 8),
		link: joinUrl("https://www.swpu.edu.cn/dxy/", $("a[title]", elem).attr("href"))
	}));
	const out = await Promise.all(items.map(async (item) => await cache_default.tryGet(item.link, async () => {
		const $ = load((await got_default.get(item.link)).data);
		if ($("title").text().startsWith("系统提示")) {
			item.author = "系统";
			item.description = "无权访问";
		} else {
			item.author = "电气信息学院";
			item.description = $(".v_news_content").html();
			for (const elem of $(".v_news_content p")) {
				if ($(elem).css("text-align") !== "right") continue;
				item.author = $(elem).text();
				break;
			}
		}
		return item;
	})));
	return {
		title: `西南石油大学电气信息学院 ${title}`,
		link: url,
		description: `西南石油大学电气信息学院 ${title}`,
		language: "zh-CN",
		item: out
	};
}
//#endregion
export { route };
