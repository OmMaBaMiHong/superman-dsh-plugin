import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/sse/inquire.tsx
const route = {
	path: "/inquire",
	categories: ["finance"],
	example: "/sse/inquire",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.sse.com.cn/disclosure/credibility/supervision/inquiries", "www.sse.com.cn/"] }],
	name: "监管问询",
	maintainers: ["Jeason0228"],
	handler,
	url: "www.sse.com.cn/disclosure/credibility/supervision/inquiries"
};
async function handler() {
	const refererUrl = "https://www.sse.com.cn/disclosure/credibility/supervision/inquiries/";
	return {
		title: "上海证券交易所 - 科创板股票审核",
		link: refererUrl,
		item: (await got_default("https://query.sse.com.cn/commonSoaQuery.do", {
			searchParams: {
				isPagination: true,
				"pageHelp.pageSize": 25,
				"pageHelp.pageNo": 1,
				"pageHelp.beginPage": 1,
				"pageHelp.cacheSize": 1,
				"pageHelp.endPage": 1,
				sqlId: "BS_KCB_GGLL",
				siteId: 28,
				channelId: "10743,10744,10012",
				type: "",
				stockcode: "",
				extWTFL: "",
				order: "createTime|desc,stockcode|asc",
				_: Date.now()
			},
			headers: { Referer: refererUrl }
		})).data.result.map((item) => ({
			title: item.extGSJC,
			description: renderToString(/* @__PURE__ */ jsx(SseInquireDescription, { item })),
			pubDate: parseDate(item.createTime),
			link: `https://${item.docURL}`,
			author: item.extGSJC
		}))
	};
}
const SseInquireDescription = ({ item }) => /* @__PURE__ */ jsxs("table", {
	border: "1",
	children: [
		/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: " 公司代码 : " }), /* @__PURE__ */ jsx("td", { children: item.stockcode })] }),
		/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: " 公司简称 : " }), /* @__PURE__ */ jsx("td", { children: item.extGSJC })] }),
		/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: " 发函日期 : " }), /* @__PURE__ */ jsx("td", { children: item.createTime })] }),
		/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: " 监管问询类型 : " }), /* @__PURE__ */ jsx("td", { children: item.extWTFL })] }),
		/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: " 标题 : " }), /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("a", {
			href: `https://${item.docURL}`,
			children: item.docTitle
		}) })] })
	]
});
//#endregion
export { route };
