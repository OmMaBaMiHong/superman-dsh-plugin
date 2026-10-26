import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as renderDescription } from "./description-CxLdA0If.mjs";
import { load } from "cheerio";
//#region lib/routes/adquan/case-library.ts
const handler = async (ctx) => {
	const limit = Number(ctx.req.query("limit") ?? "24");
	const targetUrl = new URL("case_library/index", "https://www.adquan.com").href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "zh-CN";
	let items = $("div.article_1").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		const title = $el.find("p.article_2_p").text();
		const description = renderDescription({ intro: $el.find("div.article_1_fu p").first().text() });
		const pubDateStr = $el.find("div.article_1_fu p").last().text();
		const linkUrl = $el.find("a.article_2_href").attr("href");
		const authors = $el.find("div.article_4").text();
		const image = $el.find("img.article_1_img").attr("src");
		const upDatedStr = pubDateStr;
		return {
			title,
			description,
			pubDate: pubDateStr ? parseDate(pubDateStr) : void 0,
			link: linkUrl,
			author: authors,
			content: {
				html: description,
				text: description
			},
			image,
			banner: image,
			updated: upDatedStr ? parseDate(upDatedStr) : void 0,
			language
		};
	});
	items = (await Promise.all(items.map((item) => {
		if (!item.link) return item;
		return cache_default.tryGet(item.link, async () => {
			const $$ = load(await rofetch(item.link));
			const title = $$("p.infoTitle_left").text();
			const description = renderDescription({ description: $$("div.articleContent").html() ?? void 0 });
			const pubDateStr = $$("p.time").text().split(/：/).pop();
			const categoryEls = $$("span.article_5").toArray();
			const categories = [...new Set(categoryEls.map((el) => $$(el).text()).filter(Boolean))];
			const authors = $$("div.infoTitle_right span").text();
			const upDatedStr = pubDateStr;
			const processedItem = {
				title,
				description,
				pubDate: pubDateStr ? timezone(parseDate(pubDateStr), 8) : item.pubDate,
				category: categories,
				author: authors,
				content: {
					html: description,
					text: description
				},
				updated: upDatedStr ? timezone(parseDate(upDatedStr), 8) : item.updated,
				language
			};
			return {
				...item,
				...processedItem
			};
		});
	}))).filter((_) => true);
	return {
		title: $("title").text(),
		description: $("meta[name=\"description\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("img.navi_logo").attr("src"),
		author: $("meta[name=\"author\"]").attr("content"),
		language,
		id: targetUrl
	};
};
const route = {
	path: "/case_library",
	name: "案例库",
	url: "www.adquan.com",
	maintainers: ["nczitzk"],
	handler,
	example: "/adquan/case_library",
	parameters: void 0,
	description: void 0,
	categories: ["new-media"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportRadar: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["www.adquan.com/case_library/index"],
		target: "/case_library"
	}],
	view: 0
};
//#endregion
export { handler, route };
