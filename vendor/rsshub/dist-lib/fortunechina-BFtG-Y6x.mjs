import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { n as parseRelativeDate, t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as PRESETS } from "./header-generator-DACPoxdp.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/fortunechina/index.ts
const route = {
	path: "/:category?",
	categories: ["new-media"],
	example: "/fortunechina",
	parameters: { category: "分类，见下表，默认为首页" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["fortunechina.com/:category", "fortunechina.com/"] }],
	name: "分类",
	maintainers: ["nczitzk"],
	handler,
	description: `| 商业    | 领导力    | 科技 | 研究   |
| ------- | --------- | ---- | ------ |
| shangye | lindgaoli | keji | report |`
};
async function handler(ctx) {
	const category = ctx.req.param("category") ?? "";
	const currentUrl = `https://www.fortunechina.com${category ? `/${category}` : ""}`;
	const $ = load(await rofetch(currentUrl));
	let items = $(".main").find(category === "" ? "a:has(h2)" : "h2 a").slice(0, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 15).toArray().map((item) => {
		item = $(item);
		const link = item.attr("href");
		return {
			title: item.text(),
			link: link.indexOf("http") === 0 ? link : `${currentUrl}/${item.attr("href")}`
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load(await rofetch(item.link, { headerGeneratorOptions: PRESETS.MODERN_IOS }));
		const spans = content(".date").text();
		let matches = spans.match(/(\d{4}-\d{2}-\d{2})/);
		if (matches) item.pubDate = parseDate(matches[1]);
		else {
			matches = spans.match(/(\d+小时前)/);
			if (matches) item.pubDate = parseRelativeDate(matches[1]);
		}
		item.author = content(".author").text();
		content(".mod-info, .title, .eval-zan, .eval-pic, .sae-more, .ugo-kol, .word-text .word-box .word-cn").remove();
		item.description = content(item.link.includes("content") ? ".contain .text" : ".contain .top").html();
		if (item.link.includes("jingxuan")) item.description += content(".eval-mod_ugo").html();
		else if (item.link.includes("events")) item.description = load(await rofetch(`https://www.bagevent.com/event/${item.link.match(/\d+/)[0]}`))(".page_con").html();
		else if (item.link.includes("zhuanlan")) item.description += content(".mod-word").html();
		return item;
	})));
	return {
		title: category ? $("title").text() : "财富中文网",
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
