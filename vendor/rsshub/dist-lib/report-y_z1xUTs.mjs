import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/eastmoney/utils.ts
function getRatingChangeStr(ratingChange) {
	let ratingChangeName;
	switch (String(ratingChange)) {
		case "0":
			ratingChangeName = "调高";
			break;
		case "1":
			ratingChangeName = "调低";
			break;
		case "2":
			ratingChangeName = "首次";
			break;
		case "3":
			ratingChangeName = "维持";
			break;
		case "4":
			ratingChangeName = "无";
			break;
		default:
			ratingChangeName = "-";
			break;
	}
	return ratingChangeName;
}
function getEpsOrPeStr(epsOrPe, keepDecimal) {
	let EpsOrPeStr = "";
	if (epsOrPe !== void 0) EpsOrPeStr = epsOrPe === "" ? "" : Number(epsOrPe).toFixed(keepDecimal);
	return EpsOrPeStr;
}
//#endregion
//#region lib/routes/eastmoney/report/index.tsx
const route = {
	path: "/report/:category",
	categories: ["finance"],
	view: 0,
	example: "/eastmoney/report/strategyreport",
	parameters: { category: {
		description: "研报类型",
		options: [
			{
				value: "strategyreport",
				label: "策略报告"
			},
			{
				value: "macresearch",
				label: "宏观研究"
			},
			{
				value: "brokerreport",
				label: "券商晨报"
			},
			{
				value: "industry",
				label: "行业研报"
			},
			{
				value: "stock",
				label: "个股研报"
			}
		]
	} },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["data.eastmoney.com/report/:category"] }],
	name: "研究报告",
	maintainers: ["syzq"],
	handler,
	description: `| 策略报告       | 宏观研究    | 券商晨报     | 行业研究 | 个股研报 |
| -------------- | ----------- | ------------ | -------- | -------- |
| strategyreport | macresearch | brokerreport | industry | stock    |`
};
async function handler(ctx) {
	const baseUrl = "https://data.eastmoney.com";
	const { category = "strategyreport" } = ctx.req.param();
	const reportType = {
		brokerreport: "券商晨报",
		industry: "行业研报",
		macresearch: "宏观研究",
		strategyreport: "策略报告",
		stock: "个股研报"
	};
	const linkType = {
		brokerreport: "zw_brokerreport",
		industry: "zw_industry",
		macresearch: "zw_macresearch",
		strategyreport: "zw_strategy",
		stock: "info"
	};
	const $ = load((await got_default(`${baseUrl}/report/${category}`)).data);
	const list = JSON.parse($("script").text().match(/var initdata(.=?)(.*?);/)[2]).data.map((item) => {
		const stockName = category === "stock" ? `[${item.stockName}]` : "";
		return {
			title: `[${item.orgSName}]${stockName}${item.title}`,
			link: `${baseUrl}/report/${linkType[category]}` + (category === "stock" ? `/${item.infoCode}.html` : `.jshtml?encodeUrl=${item.encodeUrl}`),
			pubDate: parseDate(item.publishDate),
			author: item.researcher,
			originItem: item
		};
	});
	const items = await Promise.all(list.map((item) => {
		const tempOriginItem = item.originItem;
		delete item.originItem;
		return cache_default.tryGet(item.link, async () => {
			try {
				const { data: response } = await got_default(item.link);
				const $ = load(response);
				if (category === "stock") {
					const { title, stockName, stockCode, emRatingName, ratingChange, indvInduName } = tempOriginItem;
					const ratingChangeStr = getRatingChangeStr(ratingChange);
					const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
					const nextYear = currentYear + 1;
					const description = $(".newsContent").html();
					const enclosureUrl = $("#ContentBody .rightlab").attr("href");
					const predictThisYearEps = getEpsOrPeStr(tempOriginItem.predictThisYearEps, 3);
					const predictThisYearPe = getEpsOrPeStr(tempOriginItem.predictThisYearPe, 2);
					const predictNextYearEps = getEpsOrPeStr(tempOriginItem.predictNextYearEps, 3);
					const predictNextYearPe = getEpsOrPeStr(tempOriginItem.predictNextYearPe, 2);
					item.enclosure_url = enclosureUrl;
					item.description = renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("table", { children: /* @__PURE__ */ jsxs("tbody", { children: [
						/* @__PURE__ */ jsxs("tr", { children: [
							/* @__PURE__ */ jsx("th", {
								rowspan: "2",
								children: "股票代码"
							}),
							/* @__PURE__ */ jsx("th", {
								rowspan: "2",
								children: "股票简称"
							}),
							/* @__PURE__ */ jsx("th", {
								rowspan: "2",
								children: "报告名称"
							}),
							/* @__PURE__ */ jsx("th", {
								rowspan: "2",
								children: "东财评级"
							}),
							/* @__PURE__ */ jsx("th", {
								rowspan: "2",
								children: "评级变动"
							}),
							/* @__PURE__ */ jsxs("th", {
								colspan: "2",
								children: [currentYear, "盈利预测"]
							}),
							/* @__PURE__ */ jsxs("th", {
								colspan: "2",
								children: [nextYear, "盈利预测"]
							}),
							/* @__PURE__ */ jsx("th", {
								rowspan: "2",
								children: "行业"
							})
						] }),
						/* @__PURE__ */ jsxs("tr", { children: [
							/* @__PURE__ */ jsx("th", { children: "收益" }),
							/* @__PURE__ */ jsx("th", { children: "市盈率" }),
							/* @__PURE__ */ jsx("th", { children: "收益" }),
							/* @__PURE__ */ jsx("th", { children: "市盈率" })
						] }),
						/* @__PURE__ */ jsxs("tr", { children: [
							/* @__PURE__ */ jsx("td", { children: stockCode }),
							/* @__PURE__ */ jsx("td", { children: stockName }),
							/* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("a", {
								href: enclosureUrl,
								children: title
							}) }),
							/* @__PURE__ */ jsx("td", { children: emRatingName }),
							/* @__PURE__ */ jsx("td", { children: ratingChangeStr }),
							/* @__PURE__ */ jsx("td", { children: predictThisYearEps }),
							/* @__PURE__ */ jsx("td", { children: predictThisYearPe }),
							/* @__PURE__ */ jsx("td", { children: predictNextYearEps }),
							/* @__PURE__ */ jsx("td", { children: predictNextYearPe }),
							/* @__PURE__ */ jsx("td", { children: indvInduName })
						] })
					] }) }), /* @__PURE__ */ jsx("div", { children: description ? raw(description) : null })] }));
				} else {
					item.link = $(".pdf-link").attr("href");
					item.description = $(".ctx-content").html();
				}
				return item;
			} catch {
				return item;
			}
		});
	}));
	return {
		title: `东方财富网-${reportType[category]}`,
		link: baseUrl,
		item: items
	};
}
//#endregion
export { route };
