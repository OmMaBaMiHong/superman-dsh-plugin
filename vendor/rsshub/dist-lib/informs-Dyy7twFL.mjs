import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/informs/index.tsx
const rootUrl = "https://pubsonline.informs.org";
const route = {
	path: "/:category?",
	categories: ["journal"],
	example: "/informs/mnsc",
	parameters: { category: "Category, can be found in the url of the page, `orsc` by default" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Category",
	maintainers: ["Fatpandac"],
	handler
};
async function handler(ctx) {
	const category = ctx.req.param("category") ?? "orsc";
	const cateUrl = `${rootUrl}/toc/${category}/0/0`;
	const getCookie = () => cache_default.tryGet(cateUrl, async () => {
		const setCookiesUrl = `${cateUrl}?cookieSet=1`;
		return (await got_default.extend({ followRedirect: false }).get(setCookiesUrl, { headers: { Referer: cateUrl } })).headers["set-cookie"].slice(1).map((item) => item.split(";", 1)[0]).join("; ");
	});
	const $ = load((await got_default.get(cateUrl, { headers: {
		referer: cateUrl,
		"User-Agent": config.ua,
		cookie: await getCookie()
	} })).data);
	const list = $("div.issue-item").slice(0, 10).toArray().map((item) => ({
		title: $(item).find("h5.issue-item__title").text(),
		link: `${rootUrl}${$(item).find("h5.issue-item__title > a").attr("href")}`,
		pubDate: parseDate($(item).find("div.rlist--inline.separator.toc-item__detail > p").remove("span").text())
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const detail = load((await got_default.get(item.link, { headers: {
			referer: cateUrl,
			"User-Agent": config.ua,
			cookie: await getCookie()
		} })).data);
		item.description = renderDescription(detail("div.accordion-tabbed.loa-accordion").text(), detail("div.hlFld-Abstract").find("h2").replaceWith($("<h2>Abstract </h2>")).end().html());
		return item;
	})));
	return {
		title: `INFORMS - ${category}`,
		link: cateUrl,
		item: items
	};
}
const renderDescription = (author, content) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	/* @__PURE__ */ jsxs("strong", { children: [
		" ",
		author,
		" "
	] }),
	/* @__PURE__ */ jsx("br", {}),
	raw(content)
] }));
//#endregion
export { route };
