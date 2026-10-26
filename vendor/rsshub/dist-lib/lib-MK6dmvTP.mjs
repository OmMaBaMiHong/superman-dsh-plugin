import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/nuist/library/lib.ts
const baseTitle = "南京信息工程大学图书馆通知";
const route = {
	path: "/lib",
	radar: [{ source: ["lib.nuist.edu.cn/", "lib.nuist.edu.cn/index/tzgg.htm"] }],
	name: "Unknown",
	maintainers: ["gylidian"],
	handler,
	url: "lib.nuist.edu.cn/"
};
async function handler() {
	const link = "https://lib.nuist.edu.cn/index/tzgg.htm";
	const $ = load((await got_default(link)).data);
	const list = $(".list2 li").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find("a").attr("title"),
			category: "通知",
			link: new URL(item.find("a").attr("href"), link).href
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const $ = load((await got_default(item.link)).data);
		item.description = $("#vsb_content").html();
		item.pubDate = parseDate($(".date").find("span").eq(0).text(), "YYYY年MM月DD日");
		return item;
	})));
	return {
		title: baseTitle,
		link,
		item: items
	};
}
//#endregion
export { route };
