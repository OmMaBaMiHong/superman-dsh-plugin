import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/cpcey/index.ts
const rootUrl = "https://cpc.ey.gov.tw";
const typeMap = {
	xwg: {
		name: "新闻稿",
		url: "/Page/A3412E2A5A7B398F"
	},
	xfzx: {
		name: "消费资讯",
		url: "/Page/E414CC218269CCE8"
	}
};
const route = {
	path: "/:type?",
	categories: ["government"],
	example: "/cpcey/xwg",
	parameters: { type: "默认为 `xwg`" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "消费资讯",
	maintainers: ["Fatpandac"],
	handler,
	description: `| 新闻稿 | 消费资讯 |
| :----: | :------: |
|   xwg  |   xfzx   |`
};
async function handler(ctx) {
	const type = ctx.req.param("type") ?? "xwg";
	const url = rootUrl + typeMap[type].url;
	const $ = load((await got_default.get(url)).data);
	const list = $("div.words > ul > li").toArray().map((item) => {
		const dateArr = $(item).find("span").text().split("-");
		const dateStr = Number.parseInt(dateArr[0]) + 1911 + "/" + dateArr[1] + "/" + dateArr[2];
		return {
			link: rootUrl + $(item).find("a").attr("href"),
			title: $(item).find("a").attr("title"),
			pubDate: parseDate(dateStr, "YYYY/MM/DD")
		};
	});
	const items = await Promise.all(list.map(async (item) => {
		let desc = "";
		if (!item.link.includes(".html")) desc = await cache_default.tryGet(item.link, async () => {
			return load((await got_default.get(item.link)).data)("div.words > div.graybg.ail > div").html();
		});
		item.description = desc;
		return item;
	}));
	return {
		title: `行政院消费者保护会-${typeMap[type].name}`,
		link: url,
		item: items
	};
}
//#endregion
export { route };
