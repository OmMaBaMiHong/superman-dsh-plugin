import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/wfu/news.ts
const baseUrl = "https://www.wfu.edu.cn";
const sizeTitle = "--潍坊学院新闻";
const catrgoryMap = {
	wyyw: ["/50/list.htm", "潍院要闻"],
	zhxw: ["/52/list.htm", "综合新闻"],
	xszh: ["/xszh/list.htm", "学术纵横"]
};
async function loadContent(link) {
	let description = "";
	let response;
	if (!/^https:\/\/www\.wfu\.edu\.cn\/.*/.test(link)) return { description };
	try {
		response = await got_default.get(link);
	} catch (error) {
		if (error.name && [
			"HTTPError",
			"RequestError",
			"FetchError"
		].includes(error.name)) description = "Page 404 Please Check!";
		return { description };
	}
	description = load(response.data)("div.wp_articlecontent").html();
	return { description };
}
const route = {
	path: "/news/:type?",
	categories: ["university"],
	example: "/wfu/news/wyyw",
	parameters: { type: "分类，默认为 `wyyw`，具体参数见下表" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["news.wfu.edu.cn/"],
		target: "/news"
	}],
	name: "新闻",
	maintainers: ["cccht"],
	handler,
	url: "news.wfu.edu.cn/",
	description: `| **内容** | **参数** |
| :------: | :------: |
| 潍院要闻 |   wyyw   |
| 综合新闻 |   zhxw   |
| 学术纵横 |   xszh   |`
};
async function handler(ctx) {
	const type = ctx.req.param("type") ?? "wyyw";
	const list = load((await got_default({
		method: "get",
		url: baseUrl + catrgoryMap[type][0],
		headers: { Referer: baseUrl }
	})).data)("div[frag=窗口1]>ul>li");
	const result = await Promise.all(list.toArray().map(async (item) => {
		const $ = load(item);
		const $item_url = "https://www.wfu.edu.cn" + $("a").attr("href");
		const single = {
			title: $("a>div.txt>h1").text(),
			pubDate: timezone(parseDate($("a>div.txt>span.date").text().split("：", 2)[1]), 8),
			link: $item_url,
			guid: $item_url
		};
		const other = await cache_default.tryGet($item_url, () => loadContent($item_url));
		return {
			...single,
			...other
		};
	}));
	return {
		title: catrgoryMap[type][1] + sizeTitle,
		link: baseUrl,
		description: catrgoryMap[type][1] + sizeTitle,
		item: result
	};
}
//#endregion
export { route };
