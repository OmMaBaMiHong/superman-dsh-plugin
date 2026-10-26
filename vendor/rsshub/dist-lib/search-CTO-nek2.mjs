import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/telecompaper/search.ts
const route = {
	path: "/search/:keyword?/:company?/:sort?/:period?",
	categories: ["journal"],
	example: "/telecompaper/search/Nokia",
	parameters: {
		keyword: "Keyword",
		company: "Company name, empty by default",
		sort: "Sorting, see table below, `Date Descending` by default",
		period: "Date selection, Last 12 months by default"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Search",
	maintainers: ["nczitzk"],
	handler,
	description: `Sorting

| Date Ascending | Date Descending |
| -------------- | --------------- |
| 1              | 2               |

Date selection

| 1 month | 3 months | 6 months | 12 months | 24 months |
| ------- | -------- | -------- | --------- | --------- |
| 1       | 3        | 6        | 12        | 24        |`
};
async function handler(ctx) {
	const keyword = ctx.req.param("keyword") || "";
	const company = ctx.req.param("company") || "";
	const sort = ctx.req.param("sort") || "2";
	const period = ctx.req.param("period") || "12";
	const rootUrl = `https://www.telecompaper.com/search/index.aspx?search=${keyword}`;
	let response = await got_default({
		method: "get",
		url: rootUrl
	}), $ = load(response.data);
	response = await got_default({
		method: "post",
		url: rootUrl,
		data: JSON.stringify({
			__EVENTTARGET: "",
			__EVENTARGUMENT: "",
			__VSTATE: $("#__VSTATE").attr("value"),
			__VIEWSTATE: "",
			ctl00$header$searchText: "Search keywords",
			ctl00$header$searchTextMobile: "Search keywords",
			ctl00$MainPlaceHolder$SearchText: keyword,
			ctl00$MainPlaceHolder$CompanyText: company,
			ctl00$MainPlaceHolder$Sort: Number.parseInt(sort),
			ctl00$MainPlaceHolder$Results: 20,
			ctl00$MainPlaceHolder$Date: "Timeframe1",
			ctl00$MainPlaceHolder$Period: Number.parseInt(period),
			ctl00$MainPlaceHolder$txtStartDate: "",
			ctl00$MainPlaceHolder$txtEndDate: "",
			ctl00$MainPlaceHolder$chkEnglish: "on",
			ctl00$MainPlaceHolder$Submit: "Search"
		})
	});
	$ = load(response.data);
	const list = $("table.details_rows tbody tr").slice(0, 15).toArray().map((item) => {
		item = $(item);
		const a = item.find("a");
		return {
			title: a.text(),
			link: a.attr("href"),
			pubDate: (/* @__PURE__ */ new Date(item.find("span.source").text().split(" | ", 1)[0] + " GMT+1")).toUTCString()
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = load((await got_default({
			method: "get",
			url: item.link
		})).data)("#pageContainer").html();
		return item;
	})));
	return {
		title: `Telecompaper Search - ${keyword}`,
		link: rootUrl,
		item: items
	};
}
//#endregion
export { route };
