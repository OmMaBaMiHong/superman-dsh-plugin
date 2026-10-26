import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/cloudflarestatus/index.tsx
const handler = async (ctx) => {
	const limit = Number(ctx.req.query("limit") ?? "100");
	const baseUrl = "https://www.cloudflarestatus.com";
	const $ = load(await rofetch(baseUrl));
	const language = $("html").attr("lang") ?? "en";
	$("div.incidents-list").remove();
	const items = $("div.update").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		const $actualTitleEl = $el.parent().parent().find("a");
		const actualTitle = $actualTitleEl.text();
		const type = $el.find("strong").first().text();
		const text = $el.find("span.whitespace-pre-wrap").first().text();
		const title = `${type ? `${type} - ` : ""}${text}`;
		const description = renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [actualTitle ? /* @__PURE__ */ jsx("h2", { children: actualTitle }) : null, $el.html() ? raw($el.html()) : null] }));
		const pubDateStr = $el.find("span.ago").attr("data-datetime-unix");
		const linkUrl = $actualTitleEl.attr("href") ? new URL($actualTitleEl.attr("href"), baseUrl).href : void 0;
		const categories = [type].filter(Boolean);
		const guid = linkUrl ? `${linkUrl}#${pubDateStr}` : "";
		const upDatedStr = pubDateStr;
		return {
			title,
			description,
			pubDate: pubDateStr ? parseDate(pubDateStr, "x") : void 0,
			link: linkUrl,
			category: categories,
			guid,
			id: guid,
			content: {
				html: description,
				text: description
			},
			updated: upDatedStr ? parseDate(upDatedStr, "x") : void 0,
			language
		};
	});
	return {
		title: $("title").text(),
		description: $("meta[name=\"description\"]").attr("content"),
		link: baseUrl,
		item: items,
		allowEmpty: true,
		language,
		id: baseUrl
	};
};
const route = {
	path: "/",
	name: "Status",
	url: "www.cloudflarestatus.com",
	maintainers: ["nczitzk"],
	handler,
	example: "/cloudflarestatus",
	parameters: void 0,
	description: void 0,
	categories: ["programming"],
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
		source: ["www.cloudflarestatus.com"],
		target: "/"
	}],
	view: 5
};
//#endregion
export { handler, route };
