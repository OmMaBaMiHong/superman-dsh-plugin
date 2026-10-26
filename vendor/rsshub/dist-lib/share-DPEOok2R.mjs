import { n as parseRelativeDate, t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/quicker/share.ts
const route = {
	path: "/share/:category?",
	categories: ["programming"],
	example: "/quicker/share/Recent",
	parameters: { category: "分类，见下表，默认为动作库最新更新" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["getquicker.net/Share/:category", "getquicker.net/"] }],
	name: "动作分享",
	maintainers: ["nczitzk"],
	handler,
	description: `| 动作库最新更新 | 动作库最多赞 | 动作库新动作 | 动作库最近赞 |
| -------------- | ------------ | ------------ | ------------ |
| Recent         | Recommended  | NewActions   | RecentLiked  |

| 子程序      | 扩展热键  | 文本指令     |
| ----------- | --------- | ------------ |
| SubPrograms | PowerKeys | TextCommands |`
};
async function handler(ctx) {
	const category = ctx.req.param("category") ?? "Recent";
	const rootUrl = "https://getquicker.net";
	const currentUrl = `${rootUrl}/Share/${category}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	let items = $("table tbody tr").slice(1, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 25).toArray().map((item) => {
		item = $(item).find("td a").first();
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
		content("section").last().remove();
		content("#app").children().slice(0, 2).remove();
		const pubDate = content(".text-secondary a").not(".text-secondary").first().text()?.trim().replaceAll(/\s*/g, "") || content("div.note-text").find("span").eq(3).text();
		item.author = content(".user-link").first().text();
		item.description = content("div[data-info=\"动作信息\"]").html() ?? content("#app").html() ?? content(".row").eq(1).html();
		item.pubDate = timezone(/-/.test(pubDate) ? parseDate(pubDate) : parseRelativeDate(pubDate), 8);
		return item;
	})));
	return {
		title: $("title").text(),
		link: currentUrl,
		item: items,
		allowEmpty: true
	};
}
//#endregion
export { route };
