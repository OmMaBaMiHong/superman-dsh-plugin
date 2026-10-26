import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/ltaaa/templates/description.tsx
const Description = ({ intro, description }) => /* @__PURE__ */ jsxs(Fragment, { children: [intro ? /* @__PURE__ */ jsx("blockquote", { children: intro }) : null, description ? /* @__PURE__ */ jsx(Fragment, { children: raw(description) }) : null] });
const renderDescription = (props) => renderToString(/* @__PURE__ */ jsx(Description, { ...props }));
//#endregion
//#region lib/routes/ltaaa/article.ts
const handler = async (ctx) => {
	const limit = Number(ctx.req.query("limit") ?? "30");
	const baseUrl = "https://www.ltaaa.cn";
	const targetUrl = new URL("article", baseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "zh-CN";
	let items = $("ul.wlist li").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		const $aEl = $el.find("div.li-title a");
		const title = $aEl.text();
		const description = renderDescription({ intro: $el.find("div.dbody p").first().text() });
		const pubDateStr = $el.find("i.icon-time").next().text().trim();
		const linkUrl = $aEl.attr("href");
		const authors = $el.find("i.icon-user").parent().find("a").toArray().map((authorEl) => {
			const $authorEl = $(authorEl);
			return {
				name: $authorEl.text(),
				url: new URL($authorEl.attr("href") ?? "", baseUrl).href,
				avatar: void 0
			};
		});
		const image = $el.find("div.li-thumb img").attr("src");
		const upDatedStr = pubDateStr;
		return {
			title,
			description,
			pubDate: pubDateStr ? parseDate(pubDateStr) : void 0,
			link: linkUrl ? new URL(linkUrl, baseUrl).href : void 0,
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
			const title = $$("div.post-title").text();
			const pubDateStr = $$("i.icon-time").next().text().trim();
			const categoryEls = $$("span.keywords a").toArray();
			const categories = [...new Set(categoryEls.map((el) => $$(el).text()).filter(Boolean))];
			const authors = $$("i.icon-user").first().nextAll("a").toArray().map((authorEl) => {
				const $$authorEl = $$(authorEl);
				return {
					name: $$authorEl.text(),
					url: new URL($$authorEl.attr("href") ?? "", baseUrl).href,
					avatar: void 0
				};
			});
			const upDatedStr = pubDateStr;
			$$("div.post-tip").each((_, el) => {
				const $$el = $$(el);
				const content = $$el.html() ?? "";
				if (content) $$el.replaceWith(`<h1>${content}</h1>`);
			});
			$$("div.post-param, div.post-title, div.post-keywords").remove();
			$$("div.attitude, div.clear").remove();
			const description = renderDescription({ description: $$("div.post-body").html() });
			const processedItem = {
				title,
				description,
				pubDate: pubDateStr ? parseDate(pubDateStr) : item.pubDate,
				category: categories,
				author: authors,
				content: {
					html: description,
					text: description
				},
				updated: upDatedStr ? parseDate(upDatedStr) : item.updated,
				language
			};
			return {
				...item,
				...processedItem
			};
		});
	}))).filter((_) => true);
	const title = $("title").text();
	return {
		title,
		description: $("meta[name=\"description\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: new URL("static/home/images/logo.png", baseUrl).href,
		author: title.split(/-/).pop(),
		language,
		id: targetUrl
	};
};
const route = {
	path: "/article",
	name: "网站翻译",
	url: "www.ltaaa.cn",
	maintainers: ["nczitzk"],
	handler,
	example: "/ltaaa/article",
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
		source: ["www.ltaaa.cn/article"],
		target: "/article"
	}],
	view: 0
};
//#endregion
export { handler, route };
