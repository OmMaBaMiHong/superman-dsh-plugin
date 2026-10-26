import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { n as setCookies, t as getCookies } from "./playwright-utils-S-7KcaVy.mjs";
import { load } from "cheerio";
//#region lib/routes/cw/utils.ts
let cookie;
const baseUrl = "https://www.cw.com.tw";
const pathMap = {
	today: {
		pageUrl: () => "/today",
		limit: 30
	},
	master: {
		pageUrl: (channel) => `/masterChannel.action?idMasterChannel=${channel}`,
		limit: 12
	},
	sub: {
		pageUrl: (channel) => `/subchannel.action?idSubChannel=${channel}`,
		limit: 12
	},
	author: {
		pageUrl: (channel) => `/author/${channel}`,
		limit: 10
	}
};
const getCookie = async (context) => {
	if (!cookie) cookie = await cache_default.tryGet("cw:cookie", async () => {
		const page = await context.newPage();
		await page.route("**/*", (route) => {
			const request = route.request();
			request.resourceType() === "document" || request.resourceType() === "script" ? route.continue() : route.abort();
		});
		logger.http(`Requesting ${baseUrl}/user/get/cookie-bar`);
		await page.goto(`${baseUrl}/user/get/cookie-bar`, { waitUntil: "domcontentloaded" });
		cookie = await getCookies(page);
		await page.close();
		return cookie;
	});
	return cookie;
};
const parsePage = async (path, context, ctx) => {
	const pageUrl = `${baseUrl}${pathMap[path].pageUrl(ctx.req.param("channel"))}`;
	const cookie = await getCookie(context);
	const page = await context.newPage();
	await page.route("**/*", (route) => {
		const request = route.request();
		request.resourceType() === "document" || request.resourceType() === "script" ? route.continue() : route.abort();
	});
	await setCookies(page, cookie, "cw.com.tw");
	logger.http(`Requesting ${pageUrl}`);
	await page.goto(pageUrl, { waitUntil: "domcontentloaded" });
	await page.waitForSelector(".caption");
	const response = await page.evaluate(() => document.documentElement.innerHTML);
	await page.close();
	const $ = load(response);
	const list = parseList($, ctx.req.query("limit") ? Number(ctx.req.query("limit")) : pathMap[path].limit);
	return {
		$,
		items: await parseItems(list, context)
	};
};
const parseList = ($, limit) => $(".caption").toArray().map((item) => {
	item = $(item);
	return {
		title: item.find("h3").text(),
		link: item.find("h3 a").attr("href"),
		pubDate: parseDate(item.find("time").text())
	};
}).slice(0, limit);
const parseItems = (list, context) => Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
	const $ = load(await rofetch(item.link, { headers: {
		Cookie: await getCookie(context),
		"User-Agent": config.ua
	} }));
	const meta = JSON.parse($("head script[type=\"application/ld+json\"]").eq(0).text());
	$(".article__head .breadcrumb, .article__head h1, .article__provideViews, .ad").remove();
	$("img.lazyload").each((_, img) => {
		if (!img.attribs["data-src"]) return;
		img.attribs.src = img.attribs["data-src"];
		delete img.attribs["data-src"];
	});
	item.title = $("head title").text();
	item.category = $("meta[name=keywords]").attr("content").split(",");
	item.pubDate = parseDate(meta.datePublished);
	item.author = meta.author.name.replace(",", " ") || meta.publisher.name;
	item.description = $(".article__head .container").html() + $(".article__content").html();
	return item;
})));
//#endregion
export { parsePage as n, baseUrl as t };
