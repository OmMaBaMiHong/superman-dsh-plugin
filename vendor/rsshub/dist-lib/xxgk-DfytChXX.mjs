import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as utils_default } from "./utils-CMHIYLf3.mjs";
import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/cde/xxgk.tsx
const baseUrl = "https://www.cde.org.cn";
const xxgkMap = { xxgk: {
	priorityApproval: {
		title: "优先审评公示",
		url: `${baseUrl}/main/xxgk/listpage/2f78f372d351c6851af7431c7710a731`,
		endPoint: "/priority/getPriorityApprovalList",
		form: {
			pageSize: 50,
			pageNum: 1,
			noticeType: 2,
			acceptid: "",
			drugname: "",
			company: ""
		}
	},
	breakthroughCure: {
		title: "突破性治疗公示",
		url: `${baseUrl}/main/xxgk/listpage/da6efd086c099b7fc949121166f0130c`,
		endPoint: "/breakthrough/getBreakthroughCureList",
		form: {
			pageSize: 50,
			pageNum: 1,
			noticeType: 1,
			acceptid: "",
			drugname: "",
			company: ""
		}
	},
	cliniCal: {
		title: "临床试验默示许可",
		url: `${baseUrl}/main/xxgk/listpage/4b5255eb0a84820cef4ca3e8b6bbe20c`,
		endPoint: "/xxgk/getCliniCalList",
		form: {
			pageSize: 50,
			pageNum: 1,
			condition: ""
		}
	}
} };
const route = {
	path: "/xxgk/:category",
	categories: ["government"],
	example: "/cde/xxgk/priorityApproval",
	parameters: { category: "类别，见下表" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "信息公开",
	maintainers: ["TonyRL"],
	handler,
	description: `|   优先审评公示   |  突破性治疗公示  | 临床试验默示许可 |
| :--------------: | :--------------: | :--------------: |
| priorityApproval | breakthroughCure |     cliniCal     |`
};
async function handler(ctx) {
	const category = ctx.req.param("category");
	const { data } = await got_default.post(`${baseUrl}/main${xxgkMap.xxgk[category].endPoint}`, {
		form: xxgkMap.xxgk[category].form,
		headers: {
			referer: xxgkMap.xxgk[category].url,
			cookie: await utils_default.getCookie(ctx)
		}
	});
	const items = data.data.records.map((item) => {
		let description;
		switch (category) {
			case "priorityApproval":
				description = renderToString(/* @__PURE__ */ jsx(PriorityApprovalTable, { item }));
				break;
			case "breakthroughCure":
				description = renderToString(/* @__PURE__ */ jsx(BreakthroughCureTable, { item }));
				break;
			case "cliniCal":
				description = renderToString(/* @__PURE__ */ jsx(CliniCalTable, { item }));
				break;
			default: description = "";
		}
		return {
			title: item.drgnamecn,
			guid: item.acceptid,
			pubDate: item.endNoticeDate ? parseDate(item.endNoticeDate) : null,
			description,
			link: xxgkMap.xxgk[category].url
		};
	});
	return {
		title: `${xxgkMap.xxgk[category].title} - 国家药品监督管理局药品审评中心`,
		link: xxgkMap.xxgk[category].url,
		item: items
	};
}
const PriorityApprovalTable = ({ item }) => /* @__PURE__ */ jsxs("table", { children: [/* @__PURE__ */ jsxs("tr", { children: [
	/* @__PURE__ */ jsx("th", { children: "受理号" }),
	/* @__PURE__ */ jsx("th", { children: "药品名称" }),
	/* @__PURE__ */ jsx("th", { children: "注册申请人" }),
	/* @__PURE__ */ jsx("th", { children: "承办日期" }),
	/* @__PURE__ */ jsx("th", { children: "申请日期" }),
	/* @__PURE__ */ jsx("th", { children: "公示日期" })
] }), /* @__PURE__ */ jsxs("tr", { children: [
	/* @__PURE__ */ jsx("td", { children: item.acceptid }),
	/* @__PURE__ */ jsx("td", { children: item.drgnamecn }),
	/* @__PURE__ */ jsx("td", { children: item.company }),
	/* @__PURE__ */ jsx("td", { children: item.createdate }),
	/* @__PURE__ */ jsx("td", { children: item.applyDate }),
	/* @__PURE__ */ jsx("td", { children: item.noticeDate })
] })] });
const BreakthroughCureTable = ({ item }) => /* @__PURE__ */ jsxs("table", { children: [/* @__PURE__ */ jsxs("tr", { children: [
	/* @__PURE__ */ jsx("th", { children: "受理号" }),
	/* @__PURE__ */ jsx("th", { children: "药品名称" }),
	/* @__PURE__ */ jsx("th", { children: "注册申请人" }),
	/* @__PURE__ */ jsx("th", { children: "申请日期" }),
	/* @__PURE__ */ jsx("th", { children: "公示日期" }),
	/* @__PURE__ */ jsx("th", { children: "公示截止日期" })
] }), /* @__PURE__ */ jsxs("tr", { children: [
	/* @__PURE__ */ jsx("td", { children: item.acceptid }),
	/* @__PURE__ */ jsx("td", { children: item.drgnamecn }),
	/* @__PURE__ */ jsx("td", { children: item.company }),
	/* @__PURE__ */ jsx("td", { children: item.applyDate }),
	/* @__PURE__ */ jsx("td", { children: item.noticeDate }),
	/* @__PURE__ */ jsx("td", { children: item.endNoticeDate })
] })] });
const CliniCalTable = ({ item }) => /* @__PURE__ */ jsxs("table", { children: [/* @__PURE__ */ jsxs("tr", { children: [
	/* @__PURE__ */ jsx("th", { children: "受理号" }),
	/* @__PURE__ */ jsx("th", { children: "药品名称" }),
	/* @__PURE__ */ jsx("th", { children: "申请人名称" }),
	/* @__PURE__ */ jsx("th", { children: "适应症" }),
	/* @__PURE__ */ jsx("th", { children: "注册分类" })
] }), /* @__PURE__ */ jsxs("tr", { children: [
	/* @__PURE__ */ jsx("td", { children: item.acceptid }),
	/* @__PURE__ */ jsx("td", { children: item.drgnamecn }),
	/* @__PURE__ */ jsx("td", { children: item.companys }),
	/* @__PURE__ */ jsx("td", { children: item.lcmsxkIndication }),
	/* @__PURE__ */ jsx("td", { children: item.lcmsxkRegisterkind })
] })] });
//#endregion
export { route };
