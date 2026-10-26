import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/bnu/jwb.ts
const route = {
	path: "/jwb",
	categories: ["university"],
	example: "/bnu/jwb",
	parameters: {},
	radar: [{ source: ["jwb.bnu.edu.cn"] }],
	name: "教务部（研究生院）",
	maintainers: ["ladeng07"],
	handler,
	url: "jwb.bnu.edu.cn/tzgg/index.htm"
};
async function handler() {
	const link = "https://jwb.bnu.edu.cn/tzgg/index.htm";
	const $ = load((await got_default(link)).data);
	const list = $(".article-list .boxlist ul li").toArray().map((e) => {
		e = $(e);
		const a = e.find("a");
		return {
			title: e.find("a span").text(),
			link: a.attr("href").startsWith("http") ? a.attr("href") : "https://jwb.bnu.edu.cn" + a.attr("href").slice(2),
			pubDate: parseDate(e.find("span.fr.text-muted").text(), "YYYY-MM-DD")
		};
	});
	return {
		title: "北京师范大学教务部",
		link,
		description: "北京师范大学教务部最新通知",
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const $ = load((await got_default(item.link)).data);
			item.author = "北京师范大学教务部";
			item.description = $(".contenttxt").html();
			return item;
		})))
	};
}
//#endregion
export { route };
