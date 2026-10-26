import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as joinUrl } from "./utils-2dNJ-pxp.mjs";
import { load } from "cheerio";
//#region lib/routes/swpu/dean.ts
const route = {
	path: "/dean/:code",
	categories: ["university"],
	example: "/swpu/dean/tzgg",
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
	name: "教务处",
	maintainers: ["CYTMWIA"],
	handler,
	url: "swpu.edu.cn/",
	description: `| 栏目 | 通知公告 | 新闻报道 | 视点声音 |
| ---- | -------- | -------- | -------- |
| 代码 | tzgg     | xwbd     | sdsy     |`
};
async function handler(ctx) {
	const url = `https://www.swpu.edu.cn/dean/${ctx.req.param("code")}.htm`;
	const $ = load((await got_default.get(url)).data);
	let title = $(".r_list > h3").text();
	title = title.slice(title.indexOf("：") + 1);
	const items = $(".r_list > ul > li").toArray().map((elem) => ({
		title: $("label:eq(0)", elem).text().trim(),
		link: joinUrl("https://www.swpu.edu.cn/dean/", $("a", elem).attr("href"))
	}));
	const out = await Promise.all(items.map(async (item) => await cache_default.tryGet(item.link, async () => {
		const $ = load((await got_default.get(item.link)).data);
		if ($("title").text().startsWith("系统提示")) {
			item.author = "系统";
			item.description = "无权访问";
		} else {
			item.author = "教务处";
			item.description = $(".v_news_content").html();
			item.pubDate = timezone(parseDate($("#lbDate").text(), "更新时间：YYYY年MM月DD日"), 8);
			for (const elem of $(".v_news_content p")) {
				if ($(elem).css("text-align") !== "right") continue;
				item.author = $(elem).text();
				break;
			}
		}
		return item;
	})));
	return {
		title: `西南石油大学教务处 ${title}`,
		link: url,
		description: `西南石油大学教务处 ${title}`,
		language: "zh-CN",
		item: out
	};
}
//#endregion
export { route };
