import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as rootUrl } from "./utils-DUymk-QL.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/gitpod/blog.tsx
const route = {
	path: "/blog",
	categories: ["programming"],
	example: "/gitpod/blog",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["gitpod.io/blog", "gitpod.io/"] }],
	name: "Blog",
	maintainers: ["TonyRL"],
	handler,
	url: "gitpod.io/blog"
};
async function handler(ctx) {
	const limit = ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 10;
	const $ = load((await got_default(rootUrl + "/blog")).data);
	let items = $("div[class^=\"flex justify-center\"]").slice(0, limit).toArray().map((item) => {
		item = $(item);
		return {
			title: item.find("h2").text(),
			link: rootUrl + item.find("a").attr("href"),
			pubDate: parseDate(item.find("span[class^=date]").text())
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default(item.link)).data);
		const headerImg = content("img[class^=max-h]");
		const contentHtml = content("div[class^=content-blog]").html();
		item.description = renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", {
			src: headerImg.attr("src"),
			alt: headerImg.attr("alt")
		}), contentHtml ? raw(contentHtml) : null] }));
		item.author = content("span.avatars a").toArray().map((e) => content(e).text().trim()).join(", ");
		return item;
	})));
	const ret = {
		title: $("title").text(),
		link: rootUrl + "/blog",
		description: $("meta[name=\"description\"]").attr("content"),
		language: "en-US",
		item: items
	};
	ctx.set("json", ret);
	return ret;
}
//#endregion
export { route };
