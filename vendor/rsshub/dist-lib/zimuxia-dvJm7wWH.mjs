import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/zimuxia/index.ts
const route = {
	path: "/:category?",
	categories: ["multimedia"],
	example: "/zimuxia",
	parameters: { category: "分类，见下表，默认为 ALL" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "分类",
	maintainers: ["nczitzk"],
	handler,
	description: `| ALL | FIX 德语社 | 欧美剧集 | 欧美电影 | 综艺 & 纪录 | FIX 日语社 | FIX 韩语社 | FIX 法语社 |
| --- | ---------- | -------- | -------- | ----------- | ---------- | ---------- | ---------- |
|     | 昆仑德语社 | 欧美剧集 | 欧美电影 | 综艺纪录    | fix 日语社 | fix 韩语社 | fix 法语社 |`
};
async function handler(ctx) {
	const category = ctx.req.param("category");
	const response = await got_default(`https://www.zimuxia.cn/我们的作品`, { searchParams: { cat: category ?? void 0 } });
	const $ = load(response.data);
	const list = $(".pg-item a").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find("h2").text(),
			link: item.attr("href")
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const detailResponse = await got_default(item.link);
		const content = load(detailResponse.data);
		const links = detailResponse.data.match(/<a href="magnet:(.*?)" target="_blank">磁力下载<\/a>/g);
		if (links) {
			item.enclosure_type = "application/x-bittorrent";
			item.enclosure_url = decodeURIComponent(links.pop().match(/<a href="(.*)" target="_blank">磁力下载<\/a>/)[1]);
		}
		item.description = content(".content-box").html();
		return item;
	})));
	return {
		title: `${category || "ALL"} - FIX字幕侠`,
		link: response.url,
		item: items
	};
}
//#endregion
export { route };
