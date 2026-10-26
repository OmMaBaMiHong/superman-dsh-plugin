import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { n as rootUrl, t as ProcessFeed } from "./utils-D-Q4_5v9.mjs";
import { load } from "cheerio";
//#region lib/routes/p-articles/contributors.ts
const route = {
	path: "/contributors/:author",
	categories: ["reading"],
	example: "/p-articles/contributors/黃衍仁",
	parameters: { author: "虛詞作者, 可在作者页面 URL 找到" },
	name: "虛詞作者",
	maintainers: ["Insomnia1437"],
	handler,
	radar: [{ source: ["p-articles.com/contributors/:author"] }]
};
async function handler(ctx) {
	const authorName = ctx.req.param("author");
	const authorUrl = new URL(`/contributors/${authorName}`, rootUrl).href;
	const $ = load(await rofetch(authorUrl));
	const list = $("div.contect_box_05in > a").toArray().map((element) => {
		return {
			title: $(element).find("h3").text().trim(),
			link: new URL($(element).attr("href"), rootUrl).href
		};
	});
	return {
		title: "虚词 p-articles",
		link: authorUrl,
		item: await Promise.all(list.map((info) => cache_default.tryGet(info.link, async () => {
			return ProcessFeed(info, await rofetch(info.link));
		}))),
		language: "zh-cn"
	};
}
//#endregion
export { route };
