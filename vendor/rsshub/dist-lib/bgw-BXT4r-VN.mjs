import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as joinUrl } from "./utils-2dNJ-pxp.mjs";
import { load } from "cheerio";
//#region lib/routes/swpu/bgw.ts
const route = {
	path: "/bgw/:code",
	categories: ["university"],
	example: "/swpu/bgw/zytzgg",
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
	name: "办公网",
	maintainers: ["CYTMWIA"],
	handler,
	url: "swpu.edu.cn/",
	description: `| 栏目 | 重要通知公告 | 部门通知公告 | 本周活动 |
| ---- | ------------ | ------------ | -------- |
| 代码 | zytzgg       | bmtzgg       | bzhd     |`
};
async function handler(ctx) {
	const url = `https://www.swpu.edu.cn/bgw/${ctx.req.param("code")}.htm`;
	const $ = load((await got_default.get(url)).data);
	const title = $(".title").text();
	const items = $(".notice > ul > li > a").toArray().map((elem) => ({
		title: $(elem.children[0]).text(),
		pubDate: timezone(parseDate($(elem.children[1]).text()), 8),
		link: joinUrl("https://www.swpu.edu.cn", $(elem).attr("href"))
	}));
	const out = await Promise.all(items.map(async (item) => await cache_default.tryGet(item.link, async () => {
		const $ = load((await got_default.get(item.link)).data);
		if ($("title").text().startsWith("系统提示")) {
			item.author = "系统";
			item.description = "无权访问";
		} else {
			item.author = "办公网";
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
		title: `西南石油大学办公网 ${title}`,
		link: url,
		description: `西南石油大学办公网 ${title} 列表`,
		language: "zh-CN",
		item: out
	};
}
//#endregion
export { route };
