import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import dayjs from "dayjs";
import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import localizedFormat from "dayjs/plugin/localizedFormat.js";
import "dayjs/locale/zh-cn.js";
//#region lib/routes/sse/renewal.tsx
dayjs.extend(localizedFormat);
const currStatusName = [
	"全部",
	"已受理",
	"已询问",
	"通过",
	"未通过",
	"提交注册",
	"补充审核",
	"注册结果",
	"中止",
	"终止"
];
const route = {
	path: "/renewal",
	categories: ["finance"],
	example: "/sse/renewal",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["kcb.sse.com.cn/home", "kcb.sse.com.cn/"] }],
	name: "科创板项目动态",
	maintainers: ["Jeason0228"],
	handler,
	url: "kcb.sse.com.cn/home"
};
async function handler() {
	const pageUrl = "https://kcb.sse.com.cn/renewal/";
	const host = "https://kcb.sse.com.cn";
	return {
		title: "上海证券交易所 - 科创板项目动态",
		link: pageUrl,
		item: (await got_default("https://query.sse.com.cn/statusAction.do", {
			searchParams: {
				isPagination: true,
				sqlId: "SH_XM_LB",
				"pageHelp.pageSize": 20,
				offerType: "",
				commitiResult: "",
				registeResult: "",
				province: "",
				csrcCode: "",
				currStatus: "",
				order: "updateDate|desc,stockAuditNum|desc",
				keyword: "",
				auditApplyDateBegin: "",
				auditApplyDateEnd: "",
				_: Date.now()
			},
			headers: { Referer: pageUrl }
		})).data.result.map((item) => ({
			title: `【${currStatusName[item.currStatus]}】${item.stockAuditName}`,
			description: renderToString(/* @__PURE__ */ jsx(SseRenewalDescription, {
				item,
				currStatus: currStatusName[item.currStatus],
				updateDate: dayjs(item.updateDate, "YYYYMMDDHHmmss").locale("zh-cn").format("lll"),
				auditApplyDate: dayjs(item.auditApplyDate, "YYYYMMDDHHmmss").locale("zh-cn").format("lll")
			})),
			pubDate: parseDate(item.updateDate, "YYYYMMDDHHmmss"),
			link: `${host}/renewal/xmxq/index.shtml?auditId=${item.stockAuditNum}`,
			author: item.stockAuditName
		}))
	};
}
const SseRenewalDescription = ({ item, currStatus, updateDate, auditApplyDate }) => /* @__PURE__ */ jsxs("table", { children: [
	/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", {
		id: "stockIssuer",
		desc: "发行人全称",
		children: "发行人全称"
	}), /* @__PURE__ */ jsx("td", { children: item.stockAuditName })] }),
	/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", {
		id: "currStatus",
		desc: "审核状态",
		children: "审核状态"
	}), /* @__PURE__ */ jsx("td", { children: currStatus })] }),
	/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", {
		id: "s_province",
		desc: "注册地",
		children: "注册地"
	}), /* @__PURE__ */ jsx("td", { children: item.stockIssuer[0].s_province })] }),
	/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", {
		id: "s_csrcCodeDesc",
		desc: "证监会行业",
		children: "证监会行业"
	}), /* @__PURE__ */ jsx("td", { children: item.stockIssuer[0].s_csrcCodeDesc })] }),
	/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", {
		id: "intermediary",
		desc: "保荐机构",
		children: "保荐机构"
	}), /* @__PURE__ */ jsx("td", { children: item.intermediary[0].i_intermediaryName })] }),
	/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", {
		id: "intermediary",
		desc: "律师事务所",
		children: "律师事务所"
	}), /* @__PURE__ */ jsx("td", { children: item.intermediary[2].i_intermediaryName })] }),
	/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", {
		id: "intermediary",
		desc: "会计师事务所",
		children: "会计师事务所"
	}), /* @__PURE__ */ jsx("td", { children: item.intermediary[1].i_intermediaryName })] }),
	item.intermediary[3] ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", {
		id: "intermediary",
		desc: "评估机构",
		children: "评估机构"
	}), /* @__PURE__ */ jsx("td", { children: item.intermediary[3].i_intermediaryName })] }) : null,
	/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", {
		id: "updateDate",
		desc: "更新日期",
		children: "更新日期"
	}), /* @__PURE__ */ jsx("td", { children: updateDate })] }),
	/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", {
		id: "auditApplyDate",
		desc: "受理日期",
		children: "受理日期"
	}), /* @__PURE__ */ jsx("td", { children: auditApplyDate })] }),
	/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "详细链接" }), /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("a", {
		href: `http://kcb.sse.com.cn/renewal/xmxq/index.shtml?auditId=${item.stockAuditNum}`,
		children: "查看详情"
	}) })] })
] });
//#endregion
export { route };
