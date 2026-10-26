import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/mwm/index.ts
const route = {
	path: "/:category?",
	categories: ["journal"],
	example: "/mwm",
	parameters: { category: "分类，见下表，默认为本期要目" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["mwm.net.cn/web/:category", "mwm.net.cn/"] }],
	name: "分类",
	maintainers: ["nczitzk"],
	handler,
	description: `| 本期要目 | 网络首发 | 学术活动 | 通知公告 |
| -------- | -------- | -------- | -------- |
| bqym     | wlsf     | xshd     | tzgg     |`
};
async function handler(ctx) {
	const category = ctx.req.param("category") ?? "bqym";
	const rootUrl = "http://www.mwm.net.cn";
	const currentUrl = `${rootUrl}/web/${category === "bqym" ? `bqym?pagesize=${ctx.req.query("limit") ?? 100}` : category}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	$(".n_date").remove();
	let items = $(".n_title, .con1_text").toArray().map((item) => {
		item = $(item);
		return {
			title: item.text(),
			link: `${rootUrl}${item.attr("href")}`
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		item.description = content(".mrt20").html();
		item.author = content(".mrl20").text().trim().replace(/作者：/, "");
		item.pubDate = parseDate(content(".date").eq(0).text(), "YYYY年MM月DD日");
		return item;
	})));
	return {
		title: $("title").text(),
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
