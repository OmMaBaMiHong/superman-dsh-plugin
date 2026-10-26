import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/wsyu/news.ts
const baseUrl = "http://www.wsyu.edu.cn";
const typeMap = {
	xxyw: {
		name: "学校要闻",
		url: "/info/iList.jsp?cat_id=10307"
	},
	zhxw: {
		name: "综合新闻",
		url: "/info/iList.jsp?cat_id=10119"
	},
	mtjj: {
		name: "媒体聚焦",
		url: "/info/iList.jsp?cat_id=10120"
	}
};
const route = {
	path: "/news/:type?",
	categories: ["university"],
	example: "/wsyu/news/xxyw",
	parameters: { type: "分类，默认为 `xxyw`" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "新闻中心",
	maintainers: ["Derekmini"],
	handler,
	description: `| 学校要闻 | 综合新闻 | 媒体聚焦 |
| -------- | -------- | -------- |
| xxyw     | zhxw     | mtjj     |`
};
async function handler(ctx) {
	const type = ctx.req.param("type") || "xxyw";
	const link = baseUrl + typeMap[type].url;
	const $ = load((await got_default({
		method: "get",
		url: link,
		headers: { Referer: baseUrl }
	})).data);
	const urlList = $(".mainContent li").slice(0, 10).toArray().map((e) => $("a", e).attr("href"));
	const titleList = $(".mainContent li").slice(0, 10).toArray().map((e) => $("a", e).text());
	const dateList = $(".mainContent li").slice(0, 10).toArray().map((e) => $("span", e).text());
	const out = await Promise.all(urlList.map(async (itemUrl, index) => {
		itemUrl = new URL(itemUrl, baseUrl).href;
		if (itemUrl.includes(".htm")) {
			const cacheIn = await cache_default.get(itemUrl);
			if (cacheIn) return JSON.parse(cacheIn);
			const $ = load((await got_default.get(itemUrl)).data);
			$(".content .photos").remove();
			const single = {
				title: titleList[index],
				link: itemUrl,
				description: $(".content").html(),
				pubDate: dateList[index]
			};
			cache_default.set(itemUrl, JSON.stringify(single));
			return single;
		}
		return {
			title: titleList[index],
			link: itemUrl,
			description: "此链接为文件，请点击下载",
			pubDate: dateList[index]
		};
	}));
	return {
		title: "武昌首义学院-" + typeMap[type].name,
		link,
		item: out
	};
}
//#endregion
export { route };
