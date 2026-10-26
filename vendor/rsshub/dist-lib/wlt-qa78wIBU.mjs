import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/gov/jiangsu/wlt/index.tsx
const route = {
	path: "/wlt/:page?",
	categories: ["government"],
	example: "/gov/jiangsu/wlt",
	parameters: { page: "页数，默认第 1 页" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["wlt.jiangsu.gov.cn/"],
		target: "/wlt"
	}],
	name: "文旅局审批公告",
	maintainers: ["GideonSenku"],
	handler,
	url: "wlt.jiangsu.gov.cn/"
};
async function handler(ctx) {
	const baseUrl = "http://58.213.82.179:18080/jsswlt_sgs/front";
	const currentUrl = `${baseUrl}/list.do`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl,
		searchParams: {
			type: 0,
			pageNo0: ctx.req.param("page") ?? 1
		}
	})).data);
	const list = $(".tg_tb1").toArray().map((item) => {
		const i = $(item);
		const id = i.prop("onclick").match(/openDetail\('(\d+)'\)/)?.[1] || "";
		return {
			title: i.text(),
			link: id ? `${baseUrl}/detail.do?iid=${id}` : "",
			description: "",
			pubDate: ""
		};
	}).filter((e) => e.link);
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const $ = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		const dateText = $("td:contains(\"许可决定日期\")").next().text().trim();
		const hostingUnit = $("td:contains(\"行政相对人名称\")").next().text().trim();
		const licenseNumber = $("td:contains(\"行政许可决定文书号\")").next().text().trim();
		const performanceName = $("td:contains(\"项目名称\")").next().text().trim();
		const performanceContent = $("td:contains(\"许可内容\")").next().text().trim();
		item.description = renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
			/* @__PURE__ */ jsxs("text", { children: [
				"许可日期：",
				dateText,
				" "
			] }),
			/* @__PURE__ */ jsx("br", {}),
			/* @__PURE__ */ jsxs("text", { children: [
				"行政名称：",
				hostingUnit,
				" "
			] }),
			/* @__PURE__ */ jsx("br", {}),
			/* @__PURE__ */ jsxs("text", { children: [
				"许可编号：",
				licenseNumber,
				" "
			] }),
			/* @__PURE__ */ jsx("br", {}),
			/* @__PURE__ */ jsxs("text", { children: [
				"项目名称：",
				performanceName,
				" "
			] }),
			/* @__PURE__ */ jsx("br", {}),
			/* @__PURE__ */ jsxs("text", { children: [
				"许可内容：",
				performanceContent,
				" "
			] })
		] }));
		item.pubDate = parseDate(dateText);
		return item;
	})));
	return {
		title: $("title").text(),
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
