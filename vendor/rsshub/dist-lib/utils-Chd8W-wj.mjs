import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { t as getPlaywrightPage } from "./playwright-DGfbX7qN.mjs";
import { load } from "cheerio";
//#region lib/routes/javdb/utils.ts
const allowDomain = /* @__PURE__ */ new Set([
	"javdb.com",
	"javdb571.com",
	"javdb36.com",
	"javdb007.com",
	"javdb521.com"
]);
const ProcessItems = async (ctx, currentUrl, title) => {
	const domain = ctx.req.query("domain") ?? "javdb.com";
	const url = new URL(currentUrl, `https://${domain}`);
	if (!config.feature.allow_user_supply_unsafe_domain && !allowDomain.has(url.hostname)) throw new ConfigNotFoundError(`This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`);
	const rootUrl = `https://${domain}`;
	const { page, destroy, context } = await getPlaywrightPage("about:blank");
	if (config.javdb.session) await page.context().addCookies([{
		name: "_jdb_session",
		value: config.javdb.session,
		domain,
		path: "/"
	}]);
	await page.route("**/*", (route) => {
		route.request().resourceType() === "document" ? route.continue() : route.abort();
	});
	await page.goto(url.href, { waitUntil: "domcontentloaded" });
	const response = await page.content();
	await page.close();
	const $ = load(response);
	$(".tags, .tag-can-play, .over18-modal").remove();
	let items = $("div.item").slice(0, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 20).toArray().map((item) => {
		const element = $(item);
		return {
			title: element.find(".video-title").text(),
			link: `${rootUrl}${element.find(".box").attr("href")}`,
			pubDate: parseDate(element.find(".meta").text())
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const page = await context.newPage();
		await page.route("**/*", (route) => {
			route.request().resourceType() === "document" ? route.continue() : route.abort();
		});
		logger.http(`Requesting ${item.link}`);
		await page.goto(item.link, { waitUntil: "domcontentloaded" });
		const content = load(await page.content());
		item.enclosure_type = "application/x-bittorrent";
		item.enclosure_url = content("#magnets-content button[data-clipboard-text]").first().attr("data-clipboard-text");
		content("icon").remove();
		content("#modal-review-watched, #modal-comment-warning, #modal-save-list").remove();
		content(".review-buttons, .copy-to-clipboard, .preview-video-container, .play-button").remove();
		content(".preview-images img").each((_, el) => {
			content(el).removeAttr("data-src");
			content(el).attr("src", content(el).parent().attr("href"));
		});
		item.category = content(".panel-block .value a").toArray().map((v) => content(v).text());
		item.author = content(".panel-block .value").last().parent().find(".value a").first().text();
		item.description = content(".cover-container, .column-video-cover").html() + content(".movie-panel-info").html() + content("#magnets-content").html() + content(".preview-images").html();
		await page.close();
		return item;
	})));
	const htmlTitle = $("title").text();
	const subject = htmlTitle.includes("|") ? htmlTitle.split("|", 1)[0] : "";
	await destroy();
	return {
		title: subject === "" ? title : `${subject} - ${title}`,
		link: url.href,
		item: items
	};
};
var utils_default = { ProcessItems };
//#endregion
export { utils_default as t };
