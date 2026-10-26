import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/priconne-redive/news.ts
const route = {
	path: "/news/:server?",
	categories: ["game"],
	example: "/priconne-redive/news",
	parameters: { server: "服务器，默认日服" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [
		{
			source: ["priconne-redive.jp/news"],
			target: "/news/jp"
		},
		{
			source: ["princessconnect.so-net.tw/news"],
			target: "/news/zh-tw"
		},
		{
			source: ["game.bilibili.com/pcr/news.html"],
			target: "/news/zh-cn"
		}
	],
	name: "最新公告",
	maintainers: ["SayaSS", "frankcwl"],
	handler,
	url: "priconne-redive.jp/news",
	description: `服务器

| 国服  | 台服  | 日服 |
| ----- | ----- | ---- |
| zh-cn | zh-tw | jp   |`
};
async function handler(ctx) {
	const { server = "jp" } = ctx.req.param();
	switch (server) {
		case "jp": {
			const parseContent = (htmlString) => {
				const $ = load(htmlString);
				$(".contents-body h3").remove();
				const time = $(".meta-info .time").text().trim();
				$(".meta-info").remove();
				return {
					description: $(".contents-body").html(),
					pubDate: parseDate(time)
				};
			};
			const data = (await got_default({
				method: "get",
				url: "https://priconne-redive.jp/news/"
			})).data;
			const $ = load(data);
			const list = $(".article_box");
			return {
				title: "公主链接日服-新闻",
				link: "https://priconne-redive.jp/news/",
				language: "ja",
				item: await Promise.all(list.map((index, item) => {
					item = $(item);
					const link = item.find("a").first().attr("href");
					return cache_default.tryGet(link, async () => {
						const rssitem = {
							title: item.find("h4").text(),
							link
						};
						const response = await got_default(link);
						const result = parseContent(response.data);
						rssitem.description = result.description;
						rssitem.pubDate = result.pubDate;
						return rssitem;
					});
				}))
			};
		}
		case "zh-tw": {
			const parseContent = (htmlString) => {
				const $ = load(htmlString);
				$(".news_con h2 > span").remove();
				const time = $(".news_con h2").text().trim();
				$(".news_con section h4").first().remove();
				return {
					description: $(".news_con section").html(),
					pubDate: parseDate(time)
				};
			};
			const list = load((await got_default({
				method: "get",
				url: "http://www.princessconnect.so-net.tw/news"
			})).data)(".news_con dl dd").toArray();
			return {
				title: "公主连结台服-最新公告",
				link: "http://www.princessconnect.so-net.tw/news",
				item: await Promise.all(list.map((item) => {
					const title = load(item)("a");
					const link = `http://www.princessconnect.so-net.tw${title.attr("href")}`;
					return cache_default.tryGet(link, async () => {
						const rssitem = {
							title: title.text().trim(),
							link
						};
						const response = await got_default(link);
						const result = parseContent(response.data);
						rssitem.description = result.description;
						rssitem.pubDate = result.pubDate;
						return rssitem;
					});
				}))
			};
		}
		case "zh-cn": {
			const list = (await got_default({
				method: "get",
				url: "https://api.biligame.com/news/list?gameExtensionId=267&positionId=2&typeId=&pageNum=1&pageSize=5"
			})).data;
			return {
				title: "公主连结国服-最新公告",
				link: "https://game.bilibili.com/pcr/news.html",
				item: await Promise.all(list.data.map((item) => {
					const link = `https://game.bilibili.com/pcr/news.html#detail=${item.id}`;
					return cache_default.tryGet(link, async () => {
						const rssitem = {
							title: item.title,
							link,
							pubDate: parseDate(item.ctime)
						};
						rssitem.description = (await got_default({
							method: "get",
							url: `https://api.biligame.com/news/${item.id}`
						})).data.data.content;
						return rssitem;
					});
				}))
			};
		}
		default:
	}
}
//#endregion
export { route };
