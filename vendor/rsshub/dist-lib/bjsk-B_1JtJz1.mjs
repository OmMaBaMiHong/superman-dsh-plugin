import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/bjsk/index.ts
const baseUrl = "https://www.bjsk.org.cn";
const route = {
	path: "/:path?",
	categories: ["government"],
	example: "/bjsk/newslist-1394-1474-0",
	parameters: { path: "路径，默认为 `newslist-1486-0-0`" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "通用",
	maintainers: ["TonyRL"],
	handler,
	description: `::: tip
路径处填写对应页面 URL 中 \`https://www.bjsk.org.cn/\` 和 \`.html\` 之间的字段。下面是一个例子。

若订阅 [社科资讯 > 社科要闻](https://www.bjsk.org.cn/newslist-1394-1474-0.html) 则将对应页面 URL \`https://www.bjsk.org.cn/newslist-1394-1474-0.html\` 中 \`https://www.bjsk.org.cn/\` 和 \`.html\` 之间的字段 \`newslist-1394-1474-0\` 作为路径填入。此时路由为 [\`/bjsk/newslist-1394-1474-0\`](https://rsshub.app/bjsk/newslist-1394-1474-0)
:::`
};
async function handler(ctx) {
	const { path = "newslist-1486-0-0" } = ctx.req.param();
	const link = `${baseUrl}/${path}.html`;
	const { data: response } = await got_default(link);
	const $ = load(response);
	const list = $(".article-list a").toArray().map((item) => {
		item = $(item);
		return {
			title: item.attr("title"),
			link: `${baseUrl}${item.attr("href")}`,
			pubDate: parseDate(item.find(".time").text(), "YYYY.MM.DD")
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: response } = await got_default(item.link);
		const $ = load(response);
		item.description = $(".article-main").html();
		item.author = $(".info").text().match(/作者：(.*?)来源/)[1].trim();
		return item;
	})));
	return {
		title: $("head title").text(),
		link,
		image: "https://www.bjsk.org.cn/favicon.ico",
		item: items
	};
}
//#endregion
export { route };
