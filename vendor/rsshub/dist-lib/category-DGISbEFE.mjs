import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as PRESETS } from "./header-generator-DACPoxdp.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/ddosi/category.ts
const route = {
	path: "/category/:category?",
	categories: ["blog"],
	example: "/ddosi/category/黑客工具",
	parameters: { category: "N" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["ddosi.org/category/:category/"],
		target: "/category/:category"
	}],
	name: "分类",
	maintainers: ["XinRoom"],
	handler,
	url: "ddosi.org/"
};
async function handler(ctx) {
	const url = "https://www.ddosi.org/category";
	const category = ctx.req.param("category");
	const $ = load((await got_default({
		method: "get",
		url: `${url}/${category}/`,
		headers: { Referer: url },
		headerGeneratorOptions: PRESETS.MODERN_IOS
	})).data);
	const items = $("main>article").toArray().map((i) => {
		const item = $(i);
		const href = item.find("a:first-child").attr("href");
		const title = item.find(".entry-title a").text();
		const description = item.find(".entry-content p").text();
		const date = parseDate(item.find(".meta-date a time").attr("datetime"));
		return {
			title: String(title),
			description: String(description),
			pubDate: date,
			link: String(href)
		};
	});
	return {
		title: `雨苁-${category}`,
		link: `${url}/${category}/`,
		item: items
	};
}
//#endregion
export { route };
