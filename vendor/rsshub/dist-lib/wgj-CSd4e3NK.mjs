import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/gov/sh/wgj/wgj.tsx
const route = {
	path: "/wgj/:page?",
	categories: ["government"],
	example: "/gov/sh/wgj",
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
		source: ["wsbs.wgj.sh.gov.cn/"],
		target: "/wgj"
	}],
	name: "文旅局审批公告",
	maintainers: ["gideonsenku"],
	handler,
	url: "wsbs.wgj.sh.gov.cn/"
};
async function handler(ctx) {
	const baseUrl = "http://wsbs.wgj.sh.gov.cn";
	const currentUrl = `${baseUrl}/shwgj_ywtb/core/web/welcome/index!toResultNotice.action`;
	const $ = load((await got_default({
		method: "post",
		url: currentUrl,
		searchParams: {
			flag: 1,
			"pageDoc.pageNo": ctx.req.param("page") ?? 1
		}
	})).data);
	const list = $("#div_md > table > tbody > tr > td:nth-child(1) > a").toArray().map((item) => {
		item = $(item);
		return {
			title: item.prop("innerText").replaceAll(/\s/g, ""),
			link: item.attr("href")
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const $ = load((await got_default({
			method: "get",
			url: baseUrl + item.link
		})).data);
		const dateText = $("div[align=\"right\"][style*=\"padding: 10px\"]").last().text().trim();
		const hostingUnit = $("td:contains(\"举办单位：\")").next().text().trim();
		const licenseNumber = $("td:contains(\"许可证号：\")").next().text().trim();
		const performanceName = $("td:contains(\"演出名称:\")").next().text().trim();
		const performanceDate = $("td:contains(\"演出日期：\")").next().text().trim();
		const performanceVenue = $("td:contains(\"演出场所：\")").next().text().trim();
		const mainActors = $("td:contains(\"主要演员：\")").next().text().trim();
		const actorCount = $("td:contains(\"演员人数：\")").next().text().trim();
		const showCount = $("td:contains(\"场次：\")").next().text().trim();
		item.description = renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
			/* @__PURE__ */ jsxs("text", { children: [
				"举办单位：",
				hostingUnit,
				" "
			] }),
			/* @__PURE__ */ jsx("br", {}),
			/* @__PURE__ */ jsxs("text", { children: [
				"许可证号：",
				licenseNumber,
				" "
			] }),
			/* @__PURE__ */ jsx("br", {}),
			/* @__PURE__ */ jsxs("text", { children: [
				"演出名称：",
				performanceName,
				" "
			] }),
			/* @__PURE__ */ jsx("br", {}),
			/* @__PURE__ */ jsxs("text", { children: [
				"演出日期：",
				performanceDate,
				" "
			] }),
			/* @__PURE__ */ jsx("br", {}),
			/* @__PURE__ */ jsxs("text", { children: [
				"演出场所：",
				performanceVenue,
				" "
			] }),
			/* @__PURE__ */ jsx("br", {}),
			/* @__PURE__ */ jsxs("text", { children: [
				"主要演员：",
				mainActors,
				" "
			] }),
			/* @__PURE__ */ jsx("br", {}),
			/* @__PURE__ */ jsxs("text", { children: [
				"演员人数：",
				actorCount,
				" "
			] }),
			/* @__PURE__ */ jsx("br", {}),
			/* @__PURE__ */ jsxs("text", { children: [
				"场次：",
				showCount,
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
