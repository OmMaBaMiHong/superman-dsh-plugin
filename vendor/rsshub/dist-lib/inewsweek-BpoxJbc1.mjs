import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
import iconv from "iconv-lite";
//#region lib/routes/inewsweek/index.ts
const rootUrl = "http://news.inewsweek.cn";
const route = {
	path: "/:channel",
	categories: ["traditional-media"],
	example: "/inewsweek/survey",
	parameters: { channel: "栏目" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["inewsweek.cn/:channel", "inewsweek.cn/"] }],
	name: "栏目",
	maintainers: ["changren-wcr"],
	handler,
	description: `提取文章全文。

| 封面  | 时政     | 社会    | 经济    | 国际  | 调查   | 人物   |
| ----- | -------- | ------- | ------- | ----- | ------ | ------ |
| cover | politics | society | finance | world | survey | people |`
};
async function handler(ctx) {
	const channel = ctx.req.param("channel");
	const url = `${rootUrl}/${channel}`;
	const response = await got_default(url, { responseType: "buffer" });
	const $ = load(iconv.decode(response.data, "gbk"));
	const items = await Promise.all($("div.grid-item").toArray().map((item) => {
		item = $(item);
		const href = item.find("a").attr("href");
		const articleLink = `${rootUrl}${href}`;
		return cache_default.tryGet(articleLink, async () => {
			const response = await got_default(articleLink, { responseType: "buffer" });
			const $ = load(iconv.decode(response.data, "gbk"));
			const fullText = $("div.contenttxt").html();
			const time = timezone(parseDate($("div.editor").html().split(/(\s{2,})/, 3)[2]), 8);
			return {
				title: item.find("p").text(),
				description: fullText,
				link: articleLink,
				pubDate: time
			};
		});
	}));
	return {
		title: $("title").text(),
		link: url,
		item: items
	};
}
//#endregion
export { route };
