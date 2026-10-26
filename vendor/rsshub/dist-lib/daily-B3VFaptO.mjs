import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/cztv/daily.tsx
const renderDesc = (item) => renderToString(/* @__PURE__ */ jsx(Fragment, { children: item.list?.map((entry) => /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("a", {
	href: entry.link,
	children: entry.title
}), /* @__PURE__ */ jsx("br", {})] })) }));
const route = {
	path: "/zjxwlb/daily",
	categories: ["traditional-media"],
	example: "/cztv/zjxwlb/daily",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["cztv.com/videos/zjxwlb", "cztv.com/"] }],
	name: "浙江新闻联播 - 每日合集",
	maintainers: ["yhkang"],
	handler,
	url: "cztv.com/videos/zjxwlb"
};
async function handler() {
	const url = "http://www.cztv.com/videos/zjxwlb";
	const { data: res } = await got_default(url);
	const $ = load(res);
	const list = $("#videolistss li").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find("span.t1").text(),
			link: item.find("input[name=data-url]").attr("value"),
			pubDate: timezone(parseDate(item.find("span.t2").text() + " 16:30", "YYYY-MM-DD hh:mm"), 8)
		};
	});
	return {
		title: "浙江新闻联播-每日合集",
		link: url,
		item: [{
			title: list[0].title,
			link: list[0].link,
			pubDate: list[0].pubDate,
			description: renderDesc({ list: list.slice(1) })
		}]
	};
}
//#endregion
export { route };
