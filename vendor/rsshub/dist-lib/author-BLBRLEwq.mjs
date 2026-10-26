import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import iconv from "iconv-lite";
//#region lib/routes/jjwxc/author.tsx
const route = {
	path: "/author/:id?",
	categories: ["reading"],
	example: "/jjwxc/author/4364484",
	parameters: { id: "作者 id，可在对应作者页中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "作者最新作品",
	maintainers: ["nczitzk"],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const rootUrl = "https://www.jjwxc.net";
	const currentUrl = new URL(`oneauthor.php?authorid=${id}`, rootUrl).href;
	const { data: response } = await got_default(currentUrl, { responseType: "buffer" });
	const $ = load(iconv.decode(response, "gbk"));
	const bookEl = $("font a").first();
	const bookInfoEl = bookEl.parent();
	const bookName = bookEl.text();
	const bookUrl = new URL(bookEl.prop("href"), rootUrl).href;
	const bookStatus = bookInfoEl.find("font").first().text();
	const bookWords = bookInfoEl.find("font").eq(1).text();
	const bookUpdatedTime = bookInfoEl.parent().contents().last().text().trim();
	const bookId = bookUrl.split(/=/).pop();
	const title = `${bookName}(${bookStatus}/${bookWords}/${bookUpdatedTime})`;
	const author = $("span[itemprop=\"name\"]").text();
	const items = [{
		title,
		link: bookUrl,
		description: renderToString(/* @__PURE__ */ jsx("table", { children: /* @__PURE__ */ jsxs("tbody", { children: [
			bookName ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "最近更新作品" }), /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("a", {
				href: bookUrl,
				children: bookName
			}) })] }) : null,
			bookStatus ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "作品状态" }), /* @__PURE__ */ jsx("td", { children: bookStatus })] }) : null,
			bookWords ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "作品字数" }), /* @__PURE__ */ jsx("td", { children: bookWords })] }) : null,
			bookUpdatedTime ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "最后更新时间" }), /* @__PURE__ */ jsx("td", { children: bookUpdatedTime })] }) : null
		] }) })),
		author,
		category: [bookStatus],
		guid: `jjwxc-${id}-${bookId}#${bookWords}`,
		pubDate: timezone(parseDate(bookUpdatedTime), 8)
	}];
	const logoEl = $("div.logo a img");
	const image = `https:${logoEl.prop("src")}`;
	const icon = new URL("favicon.ico", rootUrl).href;
	return {
		item: items,
		title: `${logoEl.prop("alt").replace(/logo/, "")} | ${author} - 最近更新`,
		link: currentUrl,
		description: $("span[itemprop=\"description\"]").text(),
		language: "zh",
		image,
		icon,
		logo: icon,
		subtitle: $("meta[name=\"Description\"]").prop("content"),
		author
	};
}
//#endregion
export { route };
