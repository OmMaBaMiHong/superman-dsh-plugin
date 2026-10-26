import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as joinUrl } from "./utils-2dNJ-pxp.mjs";
import { load } from "cheerio";
//#region lib/routes/swpu/scs.ts
const route = {
	path: "/scs/:code",
	categories: ["university"],
	example: "/swpu/scs/tzgg",
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
	name: "计算机与软件学院",
	maintainers: ["CYTMWIA"],
	handler,
	url: "swpu.edu.cn/",
	description: `| 栏目 | 通知公告 | 新闻速递 |
| ---- | -------- | -------- |
| 代码 | tzgg     | xwsd     |`
};
async function handler(ctx) {
	const url = `https://www.swpu.edu.cn/scs/index/${ctx.req.param("code")}.htm`;
	const $ = load((await got_default.get(url)).data);
	const title = $(".r_list > h3").text();
	const items = $(".main_conRCb > ul > li").toArray().map((elem) => ({
		title: $("em", elem).text().trim(),
		pubDate: timezone(parseDate($("span", elem).text()), 8),
		link: joinUrl("https://www.swpu.edu.cn/scs/index/", $("a", elem).attr("href"))
	}));
	const out = await Promise.all(items.map(async (item) => await cache_default.tryGet(item.link, async () => {
		const $ = load((await got_default.get(item.link)).data);
		if ($("title").text().startsWith("系统提示")) {
			item.author = "系统";
			item.description = "无权访问";
		} else {
			item.author = "计算机与软件学院";
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
		title: `西南石油大学计算机与软件学院 ${title}`,
		link: url,
		description: `西南石油大学计算机与软件学院 ${title}`,
		language: "zh-CN",
		item: out
	};
}
//#endregion
export { route };
