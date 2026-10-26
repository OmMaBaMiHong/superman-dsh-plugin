import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/gmcmonline/chinacustoms.ts
const handler = async (ctx) => {
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 10;
	const rootUrl = "http://chinacustoms.gmcmonline.com";
	const magRootUrl = "http://manager.gmcmonline.com";
	const { data: response } = await got_default(rootUrl);
	const $ = load(response);
	const author = $("p.copyright a").text();
	const language = $("html").prop("lang");
	let items = $("ul.booklist li a").toArray().slice(0, limit).map((item) => {
		item = $(item);
		const title = item.find("p.txt").text();
		const image = new URL(item.find("img").prop("src"), rootUrl).href;
		return {
			title,
			link: new URL(item.prop("href"), rootUrl).href,
			pubDate: parseDate(title, "YYYY年MM期"),
			author,
			image,
			banner: image,
			language
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: detailResponse } = await got_default(item.link);
		const $$ = load(detailResponse);
		$$("ol.breadcrumb li a").first().remove();
		const current = $$("ol.breadcrumb li a").first().text();
		const pubDate = parseDate($$("div.title").text(), "YYYY年MM月DD日");
		const image = new URL($$("div.coverline img").prop("src"), rootUrl).href;
		return $$("a.txt").toArray().map((i) => {
			i = $(i);
			const id = i.prop("href").match(/c\/(\d+)\.shtml/)?.[1] ?? void 0;
			if (!id) return;
			const title = i.prop("title") || i.text();
			const guid = `gmcmonline-chinacustoms-${id}`;
			return {
				title,
				pubDate,
				link: new URL(i.prop("href"), item.link).href,
				category: [current, i.closest("div.class-box").find("div.title-box span").text().replaceAll(/【|】/g, "") || void 0].filter(Boolean),
				author,
				guid,
				id: guid,
				image,
				banner: image,
				language,
				enclosure_url: new URL(`front/article/${id}/pdf?magazineID=2`, magRootUrl).href,
				enclosure_type: "application/pdf",
				enclosure_title: title
			};
		}).filter(Boolean);
	})));
	const title = $("title").text();
	const image = new URL($("div.img-box img").prop("src"), rootUrl).href;
	return {
		title,
		description: title,
		link: rootUrl,
		item: items.flat(),
		allowEmpty: true,
		image,
		author: title,
		language
	};
};
const route = {
	path: "/chinacustoms",
	name: "中国海关",
	url: "chinacustoms.gmcmonline.com",
	maintainers: ["nczitzk"],
	handler,
	example: "/gmcmonline/chinacustoms",
	parameters: void 0,
	description: void 0,
	categories: ["reading"],
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
		source: ["chinacustoms.gmcmonline.com"],
		target: "/chinacustoms"
	}]
};
//#endregion
export { handler, route };
