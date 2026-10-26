import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/bangumi.tv/user/blog.ts
const route = {
	path: "/user/blog/:id",
	categories: ["anime"],
	example: "/bangumi.tv/user/blog/sai",
	parameters: { id: "用户 id, 在用户页面地址栏查看" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["bgm.tv/user/:id"] }, { source: ["bangumi.tv/user/:id"] }],
	name: "用户日志",
	maintainers: ["nczitzk"],
	handler
};
async function handler(ctx) {
	const currentUrl = `https://bgm.tv/user/${ctx.req.param("id")}/blog`;
	const $ = load(await rofetch(currentUrl));
	const list = $("#entry_list div.item").find("h2.title").toArray().map((item) => {
		item = $(item);
		const a = item.find("a");
		return {
			title: a.text(),
			link: new URL(a.attr("href"), "https://bgm.tv").href,
			pubDate: timezone(parseDate(item.parent().find("small.time").text()), 0)
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = load(await rofetch(item.link))("#entry_content").html();
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
