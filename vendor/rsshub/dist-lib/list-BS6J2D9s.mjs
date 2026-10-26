import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/dedao/list.ts
const route = {
	path: "/list/:category?",
	categories: ["new-media"],
	example: "/dedao/list/年度日更",
	parameters: { category: "分类名，默认为年度日更" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["igetget.com/"] }],
	name: "首页",
	maintainers: ["nczitzk"],
	handler,
	url: "igetget.com/"
};
async function handler(ctx) {
	const category = ctx.req.param("category") ?? "年度日更";
	const rootUrl = "https://www.igetget.com";
	const currentUrl = `${rootUrl}${(await got_default({
		method: "get",
		url: `${rootUrl}${(await got_default({
			method: "get",
			url: rootUrl
		})).data.match(/<a href="(.*)">年度日更<\/a>/)[1]}`
	})).data.match(new RegExp("<span>" + category + String.raw`<\/span><a href="(.*)" rel="tag"><\/a>`))[1].split("\"", 1)[0]}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	let items = $(".pro-info p a").toArray().slice(0, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 10).map((item) => {
		item = $(item);
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
		content(".more-bt").remove();
		item.description = content(".main-content-wrapper").html();
		return item;
	})));
	return {
		title: `得到 - ${category}`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
