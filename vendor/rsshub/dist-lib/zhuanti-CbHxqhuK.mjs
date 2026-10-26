import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { n as ossUrl, r as rootUrl, t as ProcessFeed } from "./utils-B0m9BN2p.mjs";
import { load } from "cheerio";
//#region lib/routes/aisixiang/zhuanti.ts
const route = {
	path: "/zhuanti/:id",
	categories: ["reading"],
	example: "/aisixiang/zhuanti/211",
	parameters: { id: "专题 ID, 可在对应专题 URL 中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "专题",
	maintainers: ["nczitzk"],
	handler,
	description: `::: tip
更多专题请见 [关键词](http://www.aisixiang.com/zhuanti/)
:::`
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 30;
	const currentUrl = new URL(`zhuanti/${id}.html`, rootUrl).href;
	const { data: response } = await got_default(currentUrl);
	const $ = load(response);
	const title = $("div.tips h2").first().text();
	return {
		item: await ProcessFeed(limit, $("div.article-title").slice(0, limit).toArray().map((item) => {
			item = $(item);
			const a = item.find("a");
			return {
				title: a.text(),
				link: new URL(a.prop("href"), rootUrl).href,
				author: a.text().split("：", 1)[0],
				pubDate: timezone(parseDate(item.find("span").text()), 8)
			};
		})),
		title: `爱思想 - ${title}`,
		link: currentUrl,
		description: $("div.tips p").text(),
		language: "zh-cn",
		image: new URL("images/logo_zhuanti.jpg", ossUrl).href,
		subtitle: title
	};
}
//#endregion
export { route };
