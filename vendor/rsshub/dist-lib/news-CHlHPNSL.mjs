import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as utils_default } from "./utils-CXYEvGNS.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/x-mol/news.tsx
const route = {
	path: "/news/:tag?",
	categories: ["study"],
	example: "/x-mol/news/3",
	parameters: { tag: "Tag number, can be obtained from news list URL. Empty value means news index." },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["x-mol.com/news/index"],
		target: "/news"
	}],
	name: "News",
	maintainers: ["cssxsh"],
	handler,
	url: "x-mol.com/news/index"
};
async function handler(ctx) {
	const tag = ctx.req.param("tag");
	const urlPath = tag ? `news/tag/${tag}` : "news/index";
	const link = new URL(urlPath, utils_default.host).href;
	const response = await got_default(link);
	const data = response.data;
	const $ = load(data);
	const newsitem = $(".newsitem").toArray().map((element) => {
		element = $(element);
		const a = element.find("h3 a");
		const span = element.find(".space-right-m30");
		const author = span.text().replace("来源：", "").trim();
		return {
			title: a.text(),
			link: new URL(a.attr("href"), utils_default.host).href,
			description: renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [element.find("img").attr("src") ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", { src: element.find("img").attr("src").split("?", 1)[0] }), /* @__PURE__ */ jsx("br", {})] }) : null, element.find(".thsis-div a").text().trim() ? /* @__PURE__ */ jsx("p", { children: element.find(".thsis-div a").text().trim() }) : null] })),
			author,
			pubDate: span.next().length ? timezone(parseDate(span.next().text().trim()), 8) : void 0
		};
	});
	const item = await Promise.all(newsitem.map((item) => cache_default.tryGet(item.link, async () => {
		if (item.link.includes("outLinkByIdAndCode")) return item;
		const description = load((await got_default(item.link)).data)(".newscontent");
		description.find(".detitemtit, .detposttiau").remove();
		item.description = description.html();
		return item;
	})));
	return {
		title: $("title").text(),
		link: response.url,
		description: $("meta[name=\"description\"]").attr("content"),
		item
	};
}
//#endregion
export { route };
