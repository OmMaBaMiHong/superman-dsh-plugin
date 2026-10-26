import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { n as ossUrl, r as rootUrl, t as ProcessFeed } from "./utils-B0m9BN2p.mjs";
import { load } from "cheerio";
//#region lib/routes/aisixiang/column.ts
const route = {
	path: "/column/:id",
	categories: ["reading"],
	example: "/aisixiang/column/722",
	parameters: { id: "栏目 ID, 可在对应栏目 URL 中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "栏目",
	maintainers: ["HenryQW", "nczitzk"],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 30;
	const currentUrl = new URL(`/data/search?column=${id}`, rootUrl).href;
	const { data: response } = await got_default(currentUrl);
	const $ = load(response);
	const title = $("div.article-title a").first().text().replaceAll("[]", "");
	return {
		item: await ProcessFeed(limit, $("div.article-title").slice(0, limit).toArray().map((item) => {
			item = $(item);
			const a = item.find("a[title]");
			return {
				title: a.text(),
				link: new URL(a.prop("href"), rootUrl).href,
				author: a.text().split("：", 1)[0],
				pubDate: timezone(parseDate(item.find("span").text()), 8)
			};
		})),
		title: `爱思想 - ${title}`,
		link: currentUrl,
		description: $("div.tips").text(),
		language: "zh-cn",
		image: new URL("images/logo.jpg", ossUrl).href,
		subtitle: title
	};
}
//#endregion
export { route };
