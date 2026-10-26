import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/50forum/zhuanjia.ts
const route = {
	path: "/",
	radar: [{
		source: ["www.50forum.org.cn/portal/list/index.html?id=6"],
		target: ""
	}, {
		source: ["50forum.org.cn/"],
		target: ""
	}],
	name: "Unknown",
	maintainers: ["sddiky"],
	handler,
	url: "https://www.50forum.org.cn/portal/list/index.html?id=6"
};
async function handler() {
	const rootUrl = "https://www.50forum.org.cn";
	const data = (await got_default({
		method: "get",
		url: `${rootUrl}/portal/list/index.html?id=6`
	})).data;
	if (!data) return;
	const $ = load(data);
	let out = $("div.container div.list_list.mtop10 ul li").find("a").toArray().map((item) => {
		item = $(item);
		const link = rootUrl + item.attr("href");
		const keyword = /^(.+) - (.*) - (.+)$/.exec(item.text().trim());
		return {
			title: keyword[1],
			author: keyword[2],
			pubDate: timezone(parseDate(keyword[3], "YYYY-MM-DD"), 8),
			link
		};
	});
	out = await Promise.all(out.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = load((await got_default(item.link)).data)("div.list_content").html();
		return item;
	})));
	return {
		title: "中国经济50人论坛专家文章",
		link: "https://www.50forum.org.cn/portal/list/index.html?id=6",
		description: "中国经济50人论坛专家文章",
		item: out
	};
}
//#endregion
export { route };
