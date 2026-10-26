import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/freecomputerbooks/index.tsx
const baseURL = "https://freecomputerbooks.com/";
async function cheerioLoad(url) {
	return load((await got_default(url)).data);
}
const route = {
	path: "/:category?",
	name: "Book List",
	url: new URL(baseURL).host,
	maintainers: ["cubroe"],
	handler,
	example: "/freecomputerbooks/compscAlgorithmBooks",
	parameters: { category: "A category id., which should be the HTML file name (but **without** the `.html` suffix) in the URL path of a book list page." },
	categories: ["reading"],
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
		source: ["freecomputerbooks.com/", "freecomputerbooks.com/index.html"],
		target: ""
	}]
};
async function handler(ctx) {
	const categoryId = ctx.req.param("category")?.trim();
	const requestURL = categoryId ? new URL(`${categoryId}.html`, baseURL).href : baseURL;
	const $ = await cheerioLoad(requestURL);
	const categoryTitle = $(".maintitlebar").text();
	return {
		title: "Free Computer Books - " + categoryTitle,
		link: requestURL,
		description: $("title").text(),
		item: await Promise.all($("ul[id^=newBooks] > li").toArray().map((elem) => buildPostItem($(elem), categoryTitle, cache_default)))
	};
}
function buildPostItem(listItem, categoryTitle, cache) {
	const $ = load("");
	const postLink = listItem.find("a:first");
	const postInfo = listItem.find("p:contains(\"Post under\")");
	const postItem = {
		title: postLink.text(),
		link: new URL(postLink.attr("href"), baseURL).href,
		category: postInfo.length ? postInfo.find("a").toArray().map((elem) => $(elem).text()) : categoryTitle
	};
	return cache.tryGet(postItem.link, () => insertDescriptionInto(postItem));
}
async function insertDescriptionInto(item) {
	const $ = await cheerioLoad(item.link);
	$.root().find("*").contents().filter((_, node) => node.type === "comment").remove();
	const imageURL = $("#bookdesc img[title]").attr("src");
	const metadata = $("#booktitle ul").removeAttr("style");
	const content = $("#bookdesccontent").removeAttr("id");
	metadata.find("li:contains(Share This)").remove();
	content.find("img[src$=\"/hot.gif\"]").remove();
	content.find(":contains(Similar Books)").nextAll().addBack().remove();
	item.description = renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", { src: imageURL ?? "" }) }),
		raw(metadata.toString()),
		raw(content.toString())
	] }));
	return item;
}
//#endregion
export { route };
