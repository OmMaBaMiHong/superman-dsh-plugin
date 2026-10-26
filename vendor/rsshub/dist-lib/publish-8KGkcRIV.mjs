import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { jsx } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/wmc-bj/publish.tsx
const route = {
	path: "/publish/:category{.+}?",
	name: "Unknown",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const { category = "CRA-Reanalysis/2m-Temperature/6-hour/index.html" } = ctx.req.param();
	const currentUrl = new URL(`publish/${category}`, "http://www.wmc-bj.net").href;
	const { data: response } = await got_default(currentUrl);
	const $ = load(response);
	const title = $("title").text();
	const author = "World Meteorological Centre BeiJing";
	const img = $("#imgpath");
	const datetime = img.prop("data-time");
	const categories = $("ol.breadcrumb li").slice(2).toArray().map((b) => $(b).text());
	const items = [{
		title: `${datetime} ${title}`,
		link: currentUrl,
		description: renderToString(img.prop("src") ? /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", { src: img.prop("src").replace(/\/medium\//, "/") }) }) : null),
		category: categories,
		guid: `${currentUrl}#${datetime}`,
		pubDate: timezone(parseDate(/^[A-Z]{3}/i.test(datetime) ? datetime.replace(/^\w+/, "") : datetime, ["DD MMM HH:mm", "MM/DD HH:mm"]), 0)
	}];
	const image = "http://image.nmc.cn/static/wmc/img/logo-cma.png";
	const icon = $("link[rel=\"shortcut icon\"]").prop("href");
	return {
		item: items,
		title,
		link: currentUrl,
		language: "en",
		image,
		icon,
		logo: icon,
		subtitle: categories.join(" > "),
		author,
		allowEmpty: true
	};
}
//#endregion
export { route };
