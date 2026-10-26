import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/barronschina/index.ts
const route = {
	path: "/:id?",
	categories: ["finance"],
	example: "/barronschina",
	parameters: { id: "栏目 id，默认为快讯" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["barronschina.com.cn/"],
		target: "/:category?"
	}],
	name: "栏目",
	maintainers: ["nczitzk"],
	handler,
	url: "barronschina.com.cn/",
	description: `::: tip
栏目 id 留空则返回快讯，在对应页地址栏 \`columnId=\` 后可以看到。
:::`
};
async function handler(ctx) {
	const id = ctx.req.param("id") ?? "";
	const rootUrl = "http://www.barronschina.com.cn";
	const currentUrl = `${rootUrl}/index/${id ? `column/article?columnId=${id}` : "shortNews"}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	const items = id ? await Promise.all($(".title").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find(".title").text(),
			link: `${rootUrl}${item.parent().attr("href")}`
		};
	}).map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		item.description = content(".cont_main").html();
		item.pubDate = timezone(parseDate(content(".timeTag").text()), 8);
		return item;
	}))) : $("dd").toArray().map((item) => {
		item = $(item);
		const title = item.find("strong").text();
		item.find("strong").remove();
		const description = item.find(".short").html();
		item.find(".short").remove();
		return {
			title,
			description,
			link: currentUrl,
			pubDate: timezone(parseDate(`${item.parent().find("dt").text()} ${item.text()}`), 8)
		};
	});
	return {
		title: $("title").text().split("，", 1)[0],
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
