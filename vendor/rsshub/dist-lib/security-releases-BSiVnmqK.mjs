import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/apple/templates/security-releases.tsx
const SecurityReleasesDescription = ({ headers, infos, description }) => /* @__PURE__ */ jsxs(Fragment, { children: [headers && infos ? /* @__PURE__ */ jsx("table", { children: /* @__PURE__ */ jsxs("tbody", { children: [headers.length > 0 ? /* @__PURE__ */ jsx("tr", { children: headers.map((header) => /* @__PURE__ */ jsx("th", { children: header })) }) : null, infos.length > 0 ? /* @__PURE__ */ jsx("tr", { children: infos.map((info) => /* @__PURE__ */ jsx("td", { children: info ? raw(info) : null })) }) : null] }) }) : null, description ? raw(description) : null] });
const renderDescription = (data) => renderToString(/* @__PURE__ */ jsx(SecurityReleasesDescription, { ...data }));
//#endregion
//#region lib/routes/apple/security-releases.ts
const handler = async (ctx) => {
	const { language = "en-us" } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "30");
	const baseUrl = "https://support.apple.com";
	const targetUrl = new URL(`${language}/100100`, baseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const $trEls = $("table.gb-table tbody tr");
	const headers = $trEls.find("th").toArray().map((el) => $(el).text());
	let items = $trEls.slice(1, limit).toArray().map((el) => {
		const $el = $(el);
		const titleEl = $el.find("td").first();
		const title = titleEl.contents().first().text();
		const description = renderDescription({
			headers,
			infos: $el.find("td").toArray().map((el) => $(el).html() ?? "")
		});
		const pubDateStr = $el.find("td").last().text();
		const linkUrl = titleEl.find("a.gb-anchor").attr("href");
		const authors = $el.find("meta[property=\"og:site_name\"]").attr("content");
		const upDatedStr = pubDateStr;
		return {
			title,
			description,
			pubDate: pubDateStr ? parseDate(pubDateStr, ["DD MMM YYYY", "YYYY 年 MM 月 DD 日"]) : void 0,
			link: linkUrl ? new URL(linkUrl, baseUrl).href : void 0,
			author: authors,
			content: {
				html: description,
				text: description
			},
			updated: upDatedStr ? parseDate(upDatedStr, ["DD MMM YYYY", "YYYY 年 MM 月 DD 日"]) : void 0,
			language
		};
	});
	items = await Promise.all(items.map((item) => {
		if (!item.link) return item;
		return cache_default.tryGet(item.link, async () => {
			const detailResponse = await rofetch(item.link);
			const $$ = load(detailResponse);
			const title = item.title ?? $$("h1.gb-header").text();
			$$("h1.gb-header").remove();
			const description = item.description + renderDescription({ description: $$("div#sections").html() });
			const pubDateStr = detailResponse.match(/publish_date:\s"(\d{8})",/, "")?.[1];
			const authors = $$("meta[property=\"og:site_name\"]").attr("content");
			const upDatedStr = $$(".time").text() || pubDateStr;
			const processedItem = {
				title,
				description,
				pubDate: pubDateStr ? parseDate(pubDateStr, "MMDDYYYY") : item.pubDate,
				author: authors,
				content: {
					html: description,
					text: description
				},
				updated: upDatedStr ? parseDate(upDatedStr, "MMDDYYYY") : item.updated,
				language
			};
			return {
				...item,
				...processedItem
			};
		});
	}));
	return {
		title: $("title").text(),
		description: $("meta[property=\"og:description\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		author: $("meta[property=\"og:site_name\"]").attr("content"),
		language,
		id: targetUrl
	};
};
const route = {
	path: "/security-releases/:language?",
	name: "Security releases",
	url: "support.apple.com",
	maintainers: ["nczitzk"],
	handler,
	example: "/apple/security-releases",
	parameters: { language: { description: "Language, `en-us` by default" } },
	description: `::: tip
To subscribe to [Apple security releases](https://support.apple.com/en-us/100100), where the source URL is \`https://support.apple.com/en-us/100100\`, extract the certain parts from this URL to be used as parameters, resulting in the route as [\`/apple/security-releases/en-us\`](https://rsshub.app/apple/security-releases/en-us).
:::`,
	categories: ["program-update"],
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
		source: ["support.apple.com/:language/100100"],
		target: (params) => {
			const language = params.language;
			return `/apple/security-releases${language ? `/${language}` : ""}`;
		}
	}],
	view: 0,
	zh: {
		path: "/security-releases/:language?",
		name: "安全性发布",
		url: "support.apple.com",
		maintainers: ["nczitzk"],
		handler,
		example: "/apple/security-releases",
		parameters: { language: { description: "语言，默认为 `en-us`，可在对应页 URL 中找到" } },
		description: `::: tip
若订阅 [Apple 安全性发布](https://support.apple.com/zh-cn/100100)，网址为 \`https://support.apple.com/zh-cn/100100\`，请截取 \`https://support.apple.com/\` 到末尾 \`/100100\` 的部分 \`zh-cn\` 作为 \`language\` 参数填入，此时目标路由为 [\`/apple/security-releases/zh-cn\`](https://rsshub.app/apple/security-releases/zh-cn)。
:::`
	}
};
//#endregion
export { handler, route };
