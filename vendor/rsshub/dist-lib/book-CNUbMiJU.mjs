import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
import iconv from "iconv-lite";
//#region lib/routes/jjwxc/templates/book.tsx
const renderBookDescription = ({ description, chapterId, chapterName, chapterIntro, chapterUrl, chapterWords, chapterClicks, chapterUpdatedTime }) => renderToString(description ? /* @__PURE__ */ jsx(Fragment, { children: raw(description) }) : /* @__PURE__ */ jsx("table", { children: /* @__PURE__ */ jsxs("tbody", { children: [
	chapterId ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "章节" }), /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("a", {
		href: chapterUrl,
		children: chapterId
	}) })] }) : null,
	chapterName ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "标题" }), /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("a", {
		href: chapterUrl,
		children: chapterName
	}) })] }) : null,
	chapterIntro ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "内容提要" }), /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("a", {
		href: chapterUrl,
		children: chapterIntro
	}) })] }) : null,
	chapterWords ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "字数" }), /* @__PURE__ */ jsx("td", { children: chapterWords })] }) : null,
	chapterClicks ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "点击" }), /* @__PURE__ */ jsx("td", { children: chapterClicks })] }) : null,
	chapterUpdatedTime ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "更新时间" }), /* @__PURE__ */ jsx("td", { children: chapterUpdatedTime })] }) : null
] }) }));
//#endregion
//#region lib/routes/jjwxc/book.ts
const route = {
	path: "/book/:id?",
	categories: ["reading"],
	view: 5,
	example: "/jjwxc/book/7013024",
	parameters: { id: "作品 id，可在对应作品页中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "作品章节",
	maintainers: ["nczitzk"],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 100;
	const rootUrl = "https://www.jjwxc.net";
	const currentUrl = new URL(`onebook.php?novelid=${id}`, rootUrl).href;
	const { data: response } = await got_default(currentUrl, { responseType: "buffer" });
	const $ = load(iconv.decode(response, "gbk"));
	const author = $("meta[name=\"Author\"]").prop("content");
	const keywords = $("meta[name=\"Keywords\"]").prop("content").split(/,/);
	keywords.pop();
	const category = keywords.pop();
	let items = $("tr[itemprop=\"chapter\"]").toArray().map((item) => {
		item = $(item);
		const chapterId = item.find("td").first().text().trim();
		const chapterName = item.find("span[itemprop=\"headline\"]").text().trim();
		const chapterIntro = item.find("td").eq(2).text().trim();
		const chapterUrl = new URL(`onebook.php?novelid=${id}&chapterid=${chapterId}`, rootUrl).href;
		const chapterWords = item.find("td[itemprop=\"wordCount\"]").text();
		const chapterClicks = item.find("td.chapterclick").text();
		const chapterUpdatedTime = item.find("td").last().text().trim();
		const isVip = item.find("span[itemprop=\"headline\"] font").last().text() === "[VIP]";
		const isLock = item.find("td").eq(1).last().text().trim() === "[锁]";
		return {
			title: `${chapterName} ${chapterIntro}`,
			link: chapterUrl,
			description: renderBookDescription({
				chapterId,
				chapterName,
				chapterIntro,
				chapterUrl,
				chapterWords,
				chapterClicks,
				chapterUpdatedTime
			}),
			author,
			category: [isVip ? "VIP" : void 0, ...category?.split(/\s/) ?? []].filter(Boolean),
			guid: `jjwxc-${id}#${chapterId}`,
			pubDate: timezone(parseDate(chapterUpdatedTime), 8),
			isVip,
			isLock
		};
	});
	items.reverse();
	items = await Promise.all(items.slice(0, limit).map((item) => item.isLock ? Promise.resolve(item) : cache_default.tryGet(item.link, async () => {
		if (!item.isVip) {
			const { data: detailResponse } = await got_default(item.link, { responseType: "buffer" });
			const content = load(iconv.decode(detailResponse, "gbk"));
			content("span.favorite_novel").parent().remove();
			item.description += renderBookDescription({ description: content("div.novelbody").html() || void 0 });
		}
		delete item.isVip;
		return item;
	})));
	const logoEl = $("div.logo a img");
	const image = `https:${logoEl.prop("src")}`;
	const icon = new URL("favicon.ico", rootUrl).href;
	return {
		item: items,
		title: `${logoEl.prop("alt").replace(/logo/, "")} | ${author}${keywords[0]}`,
		link: currentUrl,
		description: $("span[itemprop=\"description\"]").text(),
		language: "zh",
		image,
		icon,
		logo: icon,
		subtitle: $("meta[name=\"Description\"]").prop("content"),
		author: $("meta[name=\"Author\"]").prop("content")
	};
}
//#endregion
export { route };
