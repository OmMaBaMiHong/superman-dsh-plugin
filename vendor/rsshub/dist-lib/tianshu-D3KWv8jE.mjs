import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
import iconv from "iconv-lite";
//#region lib/routes/imop/tianshu.ts
const baseUrl = "http://t.imop.com";
const route = {
	path: "/tianshu",
	categories: ["game"],
	example: "/imop/tianshu",
	radar: [{
		source: ["t.imop.com"],
		target: "/tianshu"
	}],
	name: "全部消息",
	maintainers: ["zhkgo"],
	handler
};
async function handler() {
	const { data: response } = await got_default(`${baseUrl}/list/0-1.htm`, { responseType: "buffer" });
	const $ = load(iconv.decode(response, "gbk"));
	const list = $(".right .right_top .right_bot .list2 .ul1 ul").toArray().map((item) => {
		item = $(item);
		const href = item.find("a").attr("href");
		return {
			title: item.find("a").text(),
			link: href.startsWith("http") ? href : `${baseUrl}${href}`
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: response } = await got_default(item.link, { responseType: "buffer" });
		item.description = load(iconv.decode(response, "gbk"))(".right .right_top .right_bot .articlebox").html();
		return item;
	})));
	return {
		title: "天书最新消息",
		link: `${baseUrl}/list/0-1.htm`,
		item: items
	};
}
//#endregion
export { route };
