import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/right/forum.ts
const route = {
	path: "/forum/:id?",
	categories: ["bbs"],
	example: "/right/forum/31",
	parameters: { id: "板块 id，可在板块页 URL 中找到，默认为新手入门及其它(硬件)" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "板块",
	maintainers: ["nczitzk"],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id") ?? "31";
	const limit = ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 20;
	const rootUrl = "https://www.right.com.cn";
	const currentUrl = `${rootUrl}/forum/forum-${id}-1.html`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	$("a[title=\"隐藏置顶帖\"]").each((_, el) => {
		$(el).parents("tbody").remove();
	});
	let items = $(".s").slice(0, limit).toArray().map((item) => {
		item = $(item);
		return {
			title: item.text(),
			link: `${rootUrl}/forum/${item.attr("href")}`
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		content(".pstatus").remove();
		item.author = content(".authi").first().text();
		item.description = content(".t_f").first().html();
		item.pubDate = timezone(parseDate(content(".authi em").first().text().replace("发表于 ", "")), 8);
		item.category = content(".ptg a").toArray().map((a) => content(a).text());
		return item;
	})));
	return {
		title: `${$(".xs2 a").text()} - 恩山无线论坛`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
