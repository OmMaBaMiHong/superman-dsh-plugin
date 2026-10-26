import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as parseArticle } from "./utils-DEYcDo1v2.mjs";
import { load } from "cheerio";
//#region lib/routes/sina/sports.ts
const route = {
	path: "/sports/:type?",
	name: "新浪体育",
	categories: ["sport"],
	example: "/sina/sports",
	parameters: { type: "类别" },
	maintainers: ["nczitzk"],
	handler
};
async function handler(ctx) {
	const type = ctx.req.param("type");
	let currentUrl = `https://sports.sina.com.cn/others/${type}.shtml`;
	let query = "ul.list2 li a";
	if (type === "ufc") {
		currentUrl = "http://roll.sports.sina.com.cn/s_ufc_all/index.shtml";
		query = "#d_list ul li span a";
	} else if (type === "winter" || type === "horse") {
		currentUrl = `https://sports.sina.com.cn/${type}/`;
		query = "[class^=news-list] .list li a";
	}
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	const list = $(query).toArray().map((item) => {
		item = $(item);
		return {
			title: item.text(),
			link: item.attr("href").replace("http://", "https://")
		};
	});
	const items = await Promise.all(list.map((item) => parseArticle(item)));
	return {
		title: `${$("title").text().split("_", 1)[0]} - 新浪体育`,
		description: $("meta[name=\"description\"]").attr("content"),
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
