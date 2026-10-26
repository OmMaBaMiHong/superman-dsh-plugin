import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/nbd/index.ts
const route = {
	path: "/:id?",
	categories: ["finance"],
	example: "/nbd",
	parameters: { id: "分类 id，见下表，默认为要闻" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["nbd.com.cn/", "nbd.com.cn/columns/:id?"] }],
	name: "分类",
	maintainers: ["nczitzk"],
	handler,
	url: "nbd.com.cn/",
	description: `| 头条 | 要闻 | 图片新闻 | 推荐 |
| ---- | ---- | -------- | ---- |
| 2    | 3    | 4        | 5    |`
};
async function handler(ctx) {
	const id = ctx.req.param("id") ?? "3";
	const rootUrl = "https://www.nbd.com.cn";
	const currentUrl = `${rootUrl}/columns/${id}/`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	const list = $(".u-news-title a").toArray().map((item) => {
		item = $(item);
		return {
			title: item.text(),
			link: item.attr("href")
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const detailResponse = await got_default({
			method: "get",
			url: item.link
		});
		if (!detailResponse.url.startsWith(`${rootUrl}/`)) return item;
		item.description = load(detailResponse.data)(".g-articl-text").html();
		item.pubDate = timezone(parseDate(detailResponse.data.match(/"pubDate": "(.*)"/)[1]), 8);
		return item;
	})));
	return {
		title: `${$("h1").text() || $(".u-channelname").text()} - 每经网`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
