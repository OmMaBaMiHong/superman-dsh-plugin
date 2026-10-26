import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/gov/caac/cjwt.tsx
const route = {
	path: "/cjwt/:category?",
	categories: ["government"],
	example: "/gov/caac/cjwt",
	parameters: { category: "分类，见下表，默认为全部" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["caac.gov.cn/HDJL/"],
		target: "/cjwt"
	}],
	name: "公众留言",
	maintainers: ["nczitzk"],
	handler,
	url: "caac.gov.cn/HDJL/",
	description: `| 机票 | 托运 | 无人机 | 体检 | 行政审批 | 投诉 |
| ---- | ---- | ------ | ---- | -------- | ---- |`
};
async function handler(ctx) {
	const { category = "" } = ctx.req.param();
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 30;
	const rootUrl = "https://www.caac.gov.cn";
	const apiUrl = new URL(`caacgov/jsonp/messageBoard/visit/get${category ? "CJWT" : ""}List`, rootUrl).href;
	const currentUrl = new URL("HDJL/", rootUrl).href;
	const { data: response } = await got_default(apiUrl, { searchParams: {
		callbackparam: "jsonp_messageBoard_getList",
		infoMess: category,
		pageIndex: 1
	} });
	const items = JSON.parse(response.match(/jsonp_messageBoard_getList\((.*?)\)$/)[1]).returnData.root.slice(0, limit).map((item) => ({
		title: item.infoMess.replaceAll(/<\/?em>/g, ""),
		link: new URL(`index_180.html?info=${item.id}&type=id`, rootUrl).href,
		description: renderDescription(item),
		author: `${item.gname}/${item.feedbackName}`,
		category: [item.messageType],
		guid: `caac-cjwt#${item.id}`,
		pubDate: timezone(parseDate(item.createDate), 8),
		updated: timezone(parseDate(item.feedbackDate), 8)
	}));
	const author = "中国民用航空局";
	const image = new URL("images/Logo2.png", rootUrl).href;
	const icon = new URL("images/weixinLogo.jpg", rootUrl).href;
	const subtitle = "公众留言";
	return {
		item: items,
		title: [
			author,
			subtitle,
			category
		].filter(Boolean).join(" - "),
		link: currentUrl,
		description: "向公众提供服务和开展互动交流",
		language: "zh",
		image,
		icon,
		logo: icon,
		subtitle,
		author,
		allowEmpty: true
	};
}
const renderDescription = (item) => renderToString(/* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("dl", { children: [
	/* @__PURE__ */ jsxs("dt", { children: [
		/* @__PURE__ */ jsxs("label", { children: [
			"【",
			item.messageType,
			"】"
		] }),
		/* @__PURE__ */ jsx("span", { children: item.workUnit }),
		/* @__PURE__ */ jsx("span", { children: item.gname }),
		/* @__PURE__ */ jsx("span", { children: item.createDate })
	] }),
	/* @__PURE__ */ jsx("dd", {
		style: "margin-top:10px; color:#EF7321;",
		children: /* @__PURE__ */ jsx("p", {
			style: "text-indent:1em;",
			children: item.infoMess ? raw(item.infoMess) : null
		})
	}),
	/* @__PURE__ */ jsxs("dt", {
		width: "140px",
		children: [
			/* @__PURE__ */ jsx("label", { children: "【回复】" }),
			/* @__PURE__ */ jsx("span", { children: item.feedbackName }),
			/* @__PURE__ */ jsx("span", { children: item.feedbackDate })
		]
	}),
	/* @__PURE__ */ jsx("dd", { children: /* @__PURE__ */ jsx("p", {
		style: "text-indent:1em;",
		children: item.feedback ? raw(item.feedback) : null
	}) })
] }) }));
//#endregion
export { route };
