import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/oup/index.tsx
const rootUrl = "https://academic.oup.com";
const route = {
	path: "/journals/:name",
	categories: ["journal"],
	example: "/oup/journals/adaptation",
	parameters: { name: "short name for a journal, can be found in URL" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["academic.oup.com/", "academic.oup.com/:name/issue"] }],
	name: "Oxford Academic - Journal",
	maintainers: ["Fatpandac"],
	handler,
	url: "academic.oup.com/"
};
async function handler(ctx) {
	const name = ctx.req.param("name");
	const url = `${rootUrl}/${name}/issue`;
	const response = await rofetch.raw(url);
	const cookies = response.headers.getSetCookie().map((item) => item.split(";", 1)[0]).join(";");
	const $ = load(response._data);
	const list = $("div.al-article-items").toArray().map((item) => ({
		title: $(item).find("a.at-articleLink").text(),
		link: new URL($(item).find("a.at-articleLink").attr("href"), rootUrl).href
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const $ = load(await rofetch(item.link, { headers: { Cookie: cookies } }));
		item.author = $(".al-authors-list button").text();
		item.description = renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("h2", { children: "Abstract" }), /* @__PURE__ */ jsx("p", { children: $("section.abstract > p.chapter-para").text() })] }));
		item.pubDate = parseDate($("div.citation-date").text());
		item.category = $("div.kwd-group > a").toArray().map((item) => $(item).text());
		return item;
	})));
	return {
		title: `OUP - ${name}`,
		link: url,
		item: items,
		language: $("html").attr("lang")
	};
}
//#endregion
export { route };
