import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/shoac/recent-show.tsx
const route = {
	path: "/recent-show",
	categories: ["shopping"],
	example: "/shoac/recent-show",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["shoac.com.cn/"] }],
	name: "演出月历",
	maintainers: ["TonyRL"],
	handler,
	url: "shoac.com.cn/"
};
async function handler() {
	const baseUrl = "https://www.shoac.com.cn";
	const headers = {
		Channel: "theatre_pc",
		Location: "121.458563,31.250315",
		Theater: 1323,
		"Flagship-Store": true
	};
	const { data: products } = await got_default.post(`${baseUrl}/platform-backend/good/theater/dongyi-products`, {
		headers,
		json: {
			page: 1,
			size: 12,
			calendar: false,
			timeSort: true,
			venueId: ""
		}
	});
	const list = products.data.records.map((item) => ({
		title: item.productNameShort,
		category: [item.categoryName, item.subCategoryName],
		link: `${baseUrl}/#/detail?projectId=${item.projectId}`,
		projectId: item.projectId,
		minPrice: item.minPrice,
		maxPrice: item.maxPrice,
		placeCname: item.placeCname
	}));
	return {
		title: "演出月历 - 上海东方艺术中心管理有限公司",
		link: baseUrl,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const { data: detail } = await got_default(`${baseUrl}/platform-backend/good/project/detail/old/${item.projectId}`, {
				headers,
				searchParams: {
					distributionSeriesId: "",
					distributionChannelId: ""
				}
			});
			const { data: show } = await got_default(`${baseUrl}/platform-backend/good/shows/old/${item.projectId}`, {
				headers,
				searchParams: {
					distributionSeriesId: "",
					distributionChannelId: ""
				}
			});
			item.description = renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
				detail.data.img ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", { src: detail.data.img }), /* @__PURE__ */ jsx("br", {})] }) : null,
				/* @__PURE__ */ jsxs("table", { children: [
					/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: "类型：" }), /* @__PURE__ */ jsx("td", { children: detail.data.productSubtypeName })] }),
					/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: "时间：" }), /* @__PURE__ */ jsx("td", { children: detail.data.showStartToEndTime })] }),
					/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: "地点：" }), /* @__PURE__ */ jsxs("td", { children: [
						detail.data.showPlaceName,
						"-",
						item.placeCname
					] })] }),
					/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: "￥" }), /* @__PURE__ */ jsxs("td", { children: [
						item.minPrice,
						"-",
						item.maxPrice
					] })] })
				] }),
				/* @__PURE__ */ jsx("br", {}),
				detail.data.projectDesp ? raw(detail.data.projectDesp) : null
			] }));
			item.pubDate = show.data.showInfoDetailList ? parseDate(show.data.showInfoDetailList[0].saleBeginTime, "x") : null;
			return item;
		})))
	};
}
//#endregion
export { route };
