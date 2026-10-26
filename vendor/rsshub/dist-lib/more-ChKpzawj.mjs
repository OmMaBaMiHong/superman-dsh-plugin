import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/zhibo8/more.ts
const categories = {
	nba: "NBA",
	zuqiu: "足球",
	dianjing: "电竞",
	other: "综合"
};
const route = {
	path: "/more/:category?",
	categories: ["bbs"],
	example: "/zhibo8/more/nba",
	parameters: { category: "分类，见下表，默认为 NBA" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["news.zhibo8.cc/:category"],
		target: "/more/:category"
	}],
	name: "滚动新闻",
	description: `| NBA | 足球  | 电竞     | 综合   |
| --- | ----- | -------- | ------ |
| nba | zuqiu | dianjing | zonghe |`,
	maintainers: ["nczitzk"],
	handler
};
async function handler(ctx) {
	const category = ctx.req.param("category") ?? "nba";
	const rootUrl = "https://news.zhibo8.cc";
	let list;
	let currentUrl;
	let response;
	if (category === "nba" || category === "zuqiu") {
		currentUrl = `${rootUrl}/${category}/more.htm`;
		response = await got_default(currentUrl);
		const $ = load(response.data);
		list = $("ul.articleList li").slice(0, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 100).toArray().map((item) => {
			item = $(item);
			const a = item.find("a");
			return {
				title: a.text(),
				link: `https:${a.attr("href")}`,
				pubDate: timezone(parseDate(item.find("span.postTime").text()), 8),
				category: item.attr("data-label").split(",").filter(Boolean)
			};
		});
	} else {
		currentUrl = `${rootUrl}/${category}`;
		response = await got_default(`https://api.qiumibao.com/application/app/index.php?_url=/news/${category}List`);
		list = response.data.data.list.map((item) => ({
			title: item.title,
			link: `https:${item.url}`,
			pubDate: timezone(parseDate(item.createtime), 8)
		}));
	}
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = load((await got_default(item.link)).data)("div.content").html();
		return item;
	})));
	return {
		title: `${categories[category]} - 直播吧`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
