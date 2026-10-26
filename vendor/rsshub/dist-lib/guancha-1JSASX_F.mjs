import { n as parseRelativeDate, t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/guancha/index.ts
const config = {
	review: {
		title: "评论 & 研究",
		query: ".module-news-main"
	},
	story: {
		title: "要闻",
		query: ".img-List"
	},
	fengwen: {
		title: "风闻",
		query: ".fengwen-list"
	},
	redian: { title: "热点" },
	gundong: { title: "滚动" },
	all: { title: "全部" },
	home: { title: "首页" },
	others: { title: "热点 & 滚动" }
};
const route = {
	path: "/:category?",
	categories: ["new-media"],
	example: "/guancha",
	parameters: { category: "分类，见下表，默认为全部" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["guancha.cn/"] }],
	name: "首页",
	maintainers: ["nczitzk", "Jeason0228"],
	handler,
	url: "guancha.cn/",
	description: `| 全部 | 评论 & 研究 | 要闻  | 风闻    | 热点新闻 | 滚动新闻 |
| ---- | ----------- | ----- | ------- | -------- | -------- |
| all  | review      | story | fengwen | redian   | gundong  |

home = 评论 & 研究 + 要闻 + 风闻

others = 热点新闻 + 滚动新闻

::: tip
观察者网首页左中右的三个 column 分别对应 **评论 & 研究**、**要闻**、**风闻** 三个部分。
:::`
};
async function handler(ctx) {
	const total = 10;
	const category = ctx.req.param("category") ?? "all";
	const rootUrl = "https://www.guancha.cn";
	let newsList = [], redianList = [], gundongList = [];
	if ([
		"review",
		"story",
		"fengwen",
		"all",
		"home"
	].includes(category)) {
		const $ = load((await got_default({
			method: "get",
			url: rootUrl
		})).data);
		const fetchPost = (slice) => slice.find("h4.module-title a").toArray().filter((item) => $(item).attr("href") !== "https://user.guancha.cn").map((item) => {
			item = $(item);
			const link = item.attr("href");
			return {
				title: item.text(),
				link: `${link.indexOf("http") === 0 ? "" : rootUrl}${link.replace(/\.shtml/, "_s.shtml")}`
			};
		});
		newsList = category === "all" || category === "home" ? [
			...fetchPost($(config.review.query)).slice(0, total / 3),
			...fetchPost($(config.story.query)).slice(0, total / 3),
			...fetchPost($(config.fengwen.query)).slice(0, total / 3)
		] : fetchPost($(config[category].query)).slice(0, total);
	}
	if ([
		"redian",
		"all",
		"others"
	].includes(category)) redianList = (await got_default({
		method: "get",
		url: `${rootUrl}/api/redian.htm`
	})).data.items.map((item) => ({
		title: item.TITLE,
		link: `${rootUrl}${item.HTTP_URL.replace(/\.shtml/, "_s.shtml")}`
	})).slice(0, category === "all" ? total / 3 : total);
	if ([
		"gundong",
		"all",
		"others"
	].includes(category)) gundongList = (await got_default({
		method: "get",
		url: `${rootUrl}/api/gundong.htm`
	})).data.items.map((item) => ({
		title: item.TITLE,
		link: `${rootUrl}${item.HTTP_URL.replace(/\.shtml/, "_s.shtml")}`
	})).slice(0, category === "all" ? total / 3 : total);
	const items = await Promise.all([
		...newsList,
		...redianList,
		...gundongList
	].map((item) => cache_default.tryGet(item.link, async () => {
		let detailResponse = await got_default({
			method: "get",
			url: item.link
		});
		const jumpMatch = detailResponse.data.match(/user.guancha.cn\/main\/content\?id=(.*)";/);
		if (jumpMatch !== null) {
			item.link = `https://user.guancha.cn/main/content?id=${jumpMatch[1]}&page=0`;
			detailResponse = await got_default({
				method: "get",
				url: item.link
			});
		}
		const content = load(detailResponse.data);
		const dateMatch = detailResponse.data.match(/"pubDate": "(.*)"/);
		item.pubDate = dateMatch === null ? parseRelativeDate(content(".time1").text()) : timezone(parseDate(dateMatch[1]), 8);
		item.description = content(".all-txt").html() || content(".article-txt-content").html();
		item.author = content(".author-intro p a").text() || content(".article-content div div h4 a").text() || content(".editor-intro p a").text() || content(".left-main > div.time.fix > span").eq(2).text();
		return item;
	})));
	return {
		title: `观察者网 - ${config[category].title}`,
		link: rootUrl,
		item: items
	};
}
//#endregion
export { route };
