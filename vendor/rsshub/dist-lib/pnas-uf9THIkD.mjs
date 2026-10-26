import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as outPlaywright } from "./playwright-DGfbX7qN.mjs";
import { n as setCookies } from "./playwright-utils-S-7KcaVy.mjs";
import { Fragment, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
import { CookieJar } from "tough-cookie";
//#region lib/routes/pnas/index.tsx
const route = {
	path: "/:topicPath{.+}?",
	radar: [{
		source: ["pnas.org/*topicPath"],
		target: "/:topicPath"
	}],
	name: "Unknown",
	maintainers: [],
	handler,
	url: "pnas.org/*topicPath"
};
async function handler(ctx) {
	const baseUrl = "https://www.pnas.org";
	const link = `${baseUrl}/${ctx.req.param("topicPath") ?? "latest"}`;
	let cookieJar = await cache_default.get("pnas:cookieJar");
	const cacheMiss = !cookieJar;
	cookieJar = cacheMiss ? new CookieJar() : CookieJar.fromJSON(cookieJar);
	const { data: res } = await got_default(link, { cookieJar });
	if (cacheMiss) await cache_default.set("pnas:cookieJar", cookieJar.toJSON());
	const $ = load(res);
	const list = $(".card--row-reversed .card-content").toArray().map((item) => {
		item = $(item);
		const a = item.find(".article-title a");
		return {
			title: a.text(),
			link: new URL(a.attr("href"), baseUrl).href,
			pubDate: parseDate(item.find(".card__meta__date").text())
		};
	});
	const context = await outPlaywright();
	const out = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const page = await context.newPage();
		await setCookies(page, await cookieJar.getCookieString(item.link), ".pnas.org");
		await page.route("**/*", (route) => {
			route.request().resourceType() === "document" ? route.continue() : route.abort();
		});
		logger.http(`Requesting ${item.link}`);
		await page.goto(item.link, {
			waitUntil: "domcontentloaded",
			referer: link
		});
		await page.waitForSelector(".core-container");
		const res = await page.evaluate(() => document.documentElement.innerHTML);
		await page.close();
		const $ = load(res);
		const PNASdataLayer = JSON.parse($("script").text().match(/PNASdataLayer =(.*?);/)[1]);
		$(".signup-alert-ad, .citations-truncation button").remove();
		const { keywords, topic } = PNASdataLayer.page.attributes;
		item.category = [...keywords, topic];
		item.author = PNASdataLayer.page.pageInfo.author;
		item.doi = PNASdataLayer.page.pageInfo.DOI;
		const access = PNASdataLayer.user.access === "yes";
		const abstracts = $("#abstracts .core-container").html();
		const articleBody = $("[property=articleBody]").html();
		const dataAvailability = $("#data-availability").html();
		const acknowledgments = $("#acknowledgments").html();
		const supplementaryMaterials = $("#supplementary-materials").html();
		const bibliography = $("#bibliography").html();
		item.description = renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
			abstracts ? raw(abstracts) : null,
			access && articleBody ? raw(articleBody) : null,
			dataAvailability ? raw(dataAvailability) : null,
			acknowledgments ? raw(acknowledgments) : null,
			supplementaryMaterials ? raw(supplementaryMaterials) : null,
			bibliography ? raw(bibliography) : null
		] }));
		return item;
	})));
	await context.close();
	return {
		title: `${$(".banner-widget__content h1").text()} - PNAS`,
		description: $(".banner-widget__content p").text(),
		image: "https://www.pnas.org/favicon.ico",
		language: "en-US",
		link,
		item: out
	};
}
//#endregion
export { route };
