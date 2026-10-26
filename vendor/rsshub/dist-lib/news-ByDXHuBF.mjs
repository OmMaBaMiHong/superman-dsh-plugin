import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as renderOutlink } from "./outlink-BRxwQtbW.mjs";
import { load } from "cheerio";
//#region lib/routes/lvv2/news.ts
const rootUrl = "https://lvv2.com";
const titleMap = {
	"sort-realtime": {
		"t-month": "24小时榜 一月内",
		"t-week": "24小时榜 一周内",
		"t-day": "24小时榜 一天内",
		"t-hour": "24小时榜 一小时内"
	},
	"sort-hot": "热门",
	"sort-new": "最新",
	"sort-score": {
		"t-month": "得分 一月内",
		"t-week": "得分 一周内",
		"t-day": "得分 一天内",
		"t-hour": "得分 一小时内"
	}
};
const route = {
	path: "/news/:channel/:sort?",
	categories: ["new-media"],
	example: "/lvv2/news/sort-score",
	parameters: {
		channel: "频道，见下表",
		sort: "排序方式，仅得分和24小时榜可选填该参数，见下表"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "频道",
	maintainers: ["Fatpandac"],
	handler,
	description: `|   热门   |   最新   |    得分    |   24 小时榜   |
| :------: | :------: | :--------: | :-----------: |
| sort-hot | sort-new | sort-score | sort-realtime |

| 排序方式 | 一小时内 | 一天内 | 一个周内 | 一个月内 |
| :------: | :------: | :----: | :------: | :------: |
|          |  t-hour  |  t-day |  t-week  |  t-month |`
};
async function handler(ctx) {
	const channel = ctx.req.param("channel");
	const sort = (channel === "sort-realtime" || channel === "sort-score") && !ctx.req.param("sort") ? "t-week" : ctx.req.param("sort");
	const url = `${rootUrl}/${channel}/${sort}`;
	const $ = load((await got_default(url)).data);
	const list = $("div.spacer > div").toArray().map((item) => ({
		title: $(item).find("h3 > a.title").text().trim(),
		author: $(item).find("a.author").text().trim(),
		link: new URL($(item).find("h3.title > a.title").attr("href"), rootUrl).href.replace(/(https:\/\/lvv2\.com.*?)\/title.*/, "$1"),
		pubDate: timezone(parseDate($(item).find("a.dateline > time").attr("datetime")), 8)
	})).filter((item) => item.title !== "");
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = new URL(item.link).hostname === "instant.lvv2.com" ? await cache_default.tryGet(item.link, async () => {
			return load((await got_default(item.link)).data)("#_tl_editor").html().replaceAll(/src=["'|]data.*?["'|]/g, "").replaceAll(/(<img.*?)data-src(.*?>)/g, "$1src$2");
		}) : renderOutlink(item.link);
		return item;
	})));
	return {
		title: `lvv2 - ${sort ? titleMap[channel][sort] : titleMap[channel]}`,
		link: url,
		item: items
	};
}
//#endregion
export { route };
