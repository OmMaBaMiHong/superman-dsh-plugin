import { n as parseRelativeDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/guancha/topic.ts
const route = {
	path: "/topic/:id/:order?",
	radar: [{
		source: ["guancha.cn/"],
		target: "/:category?"
	}],
	name: "Unknown",
	maintainers: ["occupy5", "nczitzk"],
	handler,
	url: "guancha.cn/"
};
async function handler(ctx) {
	const id = ctx.req.param("id") ?? "0";
	const order = ctx.req.param("order") ?? "1";
	const rootUrl = "https://user.guancha.cn";
	const currentUrl = `${rootUrl}/${id === "0" ? "main/index-list.json?" : "topic/post-list?topic_id=" + id}&page=1&order=${order}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	let items = $(".list-item h4 a, ul.home li .list-item h4 a").toArray().map((item) => {
		item = $(item);
		return {
			title: item.text(),
			link: `${rootUrl}${item.attr("href")}&page=0`
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		item.pubDate = parseRelativeDate(content(".time1").text());
		item.author = content(".user-main h4 a").first().text();
		item.description = content(".article-txt-content").html();
		return item;
	})));
	$("h1.title span").remove();
	return {
		title: `观察者网 - ${id === "0" ? "风闻" : $("h1.title").text()}`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
