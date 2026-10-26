import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/mrm/index.ts
const route = {
	path: "/:category?",
	categories: ["finance"],
	example: "/mrm",
	parameters: { category: "N" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "通知",
	maintainers: ["TonyRL"],
	handler,
	description: `| 交易通知     | 政策规定             | 业务通知          |
| ------------ | -------------------- | ----------------- |
| zonghezixun3 | zhengceguiding\\_list | yewutongzhi\\_list |`
};
async function handler(ctx) {
	const { category = "zonghezixun3" } = ctx.req.param();
	const baseUrl = "http://www.mrm.com.cn";
	const link = `${baseUrl}/${category}.html`;
	const { data: response } = await got_default(link);
	const $ = load(response);
	const list = $("#datalist_wap .li").toArray().map((item) => {
		item = $(item);
		const a = item.find("a");
		return {
			title: a.text().trim(),
			link: `${baseUrl}${a.attr("href")}`,
			pubDate: parseDate(item.find(".d").text(), "YYYY.MM.DD")
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const { data } = await got_default(item.link);
		item.description = load(data)(".article-cont").html();
		return item;
	})));
	return {
		title: $("head title").text(),
		link,
		item: items
	};
}
//#endregion
export { route };
