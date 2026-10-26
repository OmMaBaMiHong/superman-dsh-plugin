import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/eeo/templates/description.tsx
const renderDescription = ({ intro, description }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [intro ? /* @__PURE__ */ jsx("blockquote", { children: intro }) : null, description ? raw(description) : null] }));
//#endregion
//#region lib/routes/eeo/kuaixun.ts
const handler = async (ctx) => {
	const limit = Number(ctx.req.query("limit") ?? "50");
	const baseUrl = "https://www.eeo.com.cn";
	const apiUrl = "https://app.eeo.com.cn";
	const targetUrl = new URL("kuaixun/", baseUrl).href;
	const response = await rofetch(apiUrl, { query: {
		app: "article",
		controller: "index",
		action: "getMoreArticle",
		catid: 3690,
		uuid: "b048c7211db949eeb7443cd5b9b3bfe3",
		page: 1,
		pageSize: limit
	} });
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "en";
	let items = response.data.slice(0, limit).map((item) => {
		const title = item.title;
		const description = renderDescription({
			intro: item.description,
			description: item.content
		});
		const pubDate = item.published;
		const linkUrl = item.url;
		const categories = [item.catname].filter(Boolean);
		const authors = item.author;
		const guid = item.contentid ? `eeo-${item.contentid}` : "";
		const image = item.thumb;
		const updated = pubDate;
		return {
			title,
			description,
			pubDate: pubDate ? timezone(parseDate(pubDate), 8) : void 0,
			link: linkUrl,
			category: categories,
			author: authors,
			guid,
			id: guid,
			content: {
				html: description,
				text: description
			},
			image,
			banner: image,
			updated: updated ? timezone(parseDate(updated), 8) : void 0,
			language
		};
	});
	items = await Promise.all(items.map((item) => {
		if (!item.link) return item;
		return cache_default.tryGet(item.link, async () => {
			const $$ = load(await rofetch(item.link));
			const title = $$("h1").first().text() || $$("h2.title").text() || item.title;
			const description = item.description + renderDescription({ description: $$("div.xx_boxsing, div#mainBody").html() || void 0 });
			const pubDateStr = $$("h1").next().find("span").first().text() || $$("div.from").text();
			const authors = $$("h1").next().contents().first().text() || $$("span.showMoreAuthor").text() || item.author;
			const upDatedStr = pubDateStr;
			const processedItem = {
				title,
				description,
				pubDate: pubDateStr ? timezone(parseDate(pubDateStr), 8) : item.pubDate,
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
	}));
	return {
		title: $("title").text(),
		description: $("meta[name=\"description\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("div.logo img").attr("src"),
		author: $("meta[name=\"author\"]").attr("content"),
		language,
		id: $("meta[property=\"og:url\"]").attr("content")
	};
};
const route = {
	path: "/kuaixun",
	name: "快讯",
	url: "www.eeo.com.cn",
	maintainers: ["nczitzk"],
	handler,
	example: "/eeo/kuaixun",
	parameters: void 0,
	description: void 0,
	categories: ["finance"],
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
		source: ["www.eeo.com.cn/kuaixun/"],
		target: "/kuaixun"
	}],
	view: 0
};
//#endregion
export { handler, route };
