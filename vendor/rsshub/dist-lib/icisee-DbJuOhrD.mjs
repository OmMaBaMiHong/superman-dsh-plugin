import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { r as finishArticleItem } from "./wechat-mp-D2I-Y5FJ.mjs";
import { load } from "cheerio";
//#region lib/routes/sjtu/seiee/icisee.ts
const route = {
	path: "/seiee/icisee/:cat",
	categories: ["university"],
	example: "/sjtu/seiee/icisee/news",
	parameters: { cat: "子类别" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [],
	name: "集成电路学院（信息与电子工程学院）",
	maintainers: ["dzx-dzx"],
	handler
};
async function handler(ctx) {
	const currentUrl = `https://icisee.sjtu.edu.cn//${ctx.req.param("cat")}.html`;
	const $ = load(await rofetch(currentUrl));
	const list = $(".djdt li").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find(".tit").text().trim(),
			link: item.find("a").attr("href"),
			pubDate: timezone(parseDate(item.find(".time").text().trim()))
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const detailResponse = await rofetch.raw(item.link);
		if (new URL(detailResponse.url).hostname !== "mp.weixin.qq.com") return {
			...item,
			description: $(detailResponse._data).find(".xwxq").html()
		};
		item.link = detailResponse.url;
		return await finishArticleItem(item);
	})));
	return {
		title: $("title").text(),
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
