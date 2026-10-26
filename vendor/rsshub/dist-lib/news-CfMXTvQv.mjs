import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/scut/gzic/news.ts
const route = {
	path: "/gzic/news",
	categories: ["university"],
	example: "/scut/gzic/news",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "广州国际校区 - 新闻聚焦",
	maintainers: ["gdzhht"],
	handler,
	description: `::: warning
由于学校网站对非大陆 IP 的访问存在限制，可能需自行部署。
:::`
};
async function handler() {
	const baseUrl = "https://www2.scut.edu.cn";
	const url = "https://www2.scut.edu.cn/gzic/30279/list.htm";
	const { data: response } = await got_default(url);
	const $ = load(response);
	const list = $(".right-nr .row .col-lg-4").toArray().map((item) => {
		item = $(item);
		const a = item.find(".li-img a");
		const pubDate = item.find(".li-img a span");
		return {
			title: item.find(".li-img a p").text(),
			link: a.attr("href")?.startsWith("http") ? a.attr("href") : `${baseUrl}${a.attr("href")}`,
			pubDate: parseDate(pubDate.text().replaceAll(/年|月/g, "-").replaceAll("日", "")),
			itunes_item_image: `${baseUrl}${item.find(".li-img img").attr("src")}`
		};
	});
	return {
		title: "华南理工大学广州国际校区 - 新闻聚焦",
		link: url,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const $ = load(await rofetch(item.link));
			item.description = item.link.startsWith("https://mp.weixin.qq.com/") ? $("div.rich_media_content section").html() : $("div.wp_articlecontent").html();
			return item;
		})))
	};
}
//#endregion
export { route };
