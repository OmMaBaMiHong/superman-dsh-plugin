import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/hellogithub/report.tsx
const renderReport = ({ tiobeList, activeList, allList, dbList }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	tiobeList?.length ? /* @__PURE__ */ jsx("table", { children: /* @__PURE__ */ jsxs("tbody", { children: [/* @__PURE__ */ jsxs("tr", { children: [
		/* @__PURE__ */ jsx("th", { children: "排名" }),
		/* @__PURE__ */ jsx("th", { children: "编程语言" }),
		/* @__PURE__ */ jsx("th", { children: "流行度" }),
		/* @__PURE__ */ jsx("th", { children: "对比上月" }),
		/* @__PURE__ */ jsx("th", { children: "年度明星语言" })
	] }), tiobeList.map((item) => /* @__PURE__ */ jsxs("tr", { children: [
		/* @__PURE__ */ jsx("td", { children: item.position }),
		/* @__PURE__ */ jsx("td", { children: item.name }),
		/* @__PURE__ */ jsx("td", { children: item.rating }),
		/* @__PURE__ */ jsx("td", { children: item.change || "新上榜" }),
		/* @__PURE__ */ jsx("td", { children: item.star })
	] }))] }) }) : null,
	allList?.length ? /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx("h1", { children: "市场份额排名" }),
		/* @__PURE__ */ jsx("table", { children: /* @__PURE__ */ jsxs("tbody", { children: [/* @__PURE__ */ jsxs("tr", { children: [
			/* @__PURE__ */ jsx("th", { children: "排名" }),
			/* @__PURE__ */ jsx("th", { children: "服务器" }),
			/* @__PURE__ */ jsx("th", { children: "占比" }),
			/* @__PURE__ */ jsx("th", { children: "对比上月" }),
			/* @__PURE__ */ jsx("th", { children: "总数" })
		] }), allList.map((item) => /* @__PURE__ */ jsxs("tr", { children: [
			/* @__PURE__ */ jsx("td", { children: item.position }),
			/* @__PURE__ */ jsx("td", { children: item.name }),
			/* @__PURE__ */ jsx("td", { children: item.rating }),
			/* @__PURE__ */ jsx("td", { children: item.change || "新上榜" }),
			/* @__PURE__ */ jsx("td", { children: item.total })
		] }))] }) }),
		/* @__PURE__ */ jsx("br", {})
	] }) : null,
	activeList?.length ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("h1", { children: "活跃网站排名" }), /* @__PURE__ */ jsx("table", { children: /* @__PURE__ */ jsxs("tbody", { children: [/* @__PURE__ */ jsxs("tr", { children: [
		/* @__PURE__ */ jsx("th", { children: "排名" }),
		/* @__PURE__ */ jsx("th", { children: "服务器" }),
		/* @__PURE__ */ jsx("th", { children: "占比" }),
		/* @__PURE__ */ jsx("th", { children: "对比上月" }),
		/* @__PURE__ */ jsx("th", { children: "总数" })
	] }), activeList.map((item) => /* @__PURE__ */ jsxs("tr", { children: [
		/* @__PURE__ */ jsx("td", { children: item.position }),
		/* @__PURE__ */ jsx("td", { children: item.name }),
		/* @__PURE__ */ jsx("td", { children: item.rating }),
		/* @__PURE__ */ jsx("td", { children: item.change || "新上榜" }),
		/* @__PURE__ */ jsx("td", { children: item.total })
	] }))] }) })] }) : null,
	dbList?.length ? /* @__PURE__ */ jsx("table", { children: /* @__PURE__ */ jsxs("tbody", { children: [/* @__PURE__ */ jsxs("tr", { children: [
		/* @__PURE__ */ jsx("th", { children: "排名" }),
		/* @__PURE__ */ jsx("th", { children: "数据库" }),
		/* @__PURE__ */ jsx("th", { children: "分数" }),
		/* @__PURE__ */ jsx("th", { children: "对比上月" }),
		/* @__PURE__ */ jsx("th", { children: "类型" })
	] }), dbList.map((item) => /* @__PURE__ */ jsxs("tr", { children: [
		/* @__PURE__ */ jsx("td", { children: item.position }),
		/* @__PURE__ */ jsx("td", { children: item.name }),
		/* @__PURE__ */ jsx("td", { children: item.rating }),
		/* @__PURE__ */ jsx("td", { children: item.change || "新上榜" }),
		/* @__PURE__ */ jsx("td", { children: item.db_model })
	] }))] }) }) : null
] }));
const types = {
	tiobe: "编程语言",
	netcraft: "服务器",
	"db-engines": "数据库"
};
const route = {
	path: "/ranking/:type?",
	example: "/hellogithub/ranking",
	name: "榜单报告",
	maintainers: ["moke8", "nczitzk"],
	handler,
	description: `| 编程语言 | 服务器   | 数据库     |
| -------- | -------- | ---------- |
| tiobe    | netcraft | db-engines |`
};
async function handler(ctx) {
	let type = ctx.req.param("type") ?? "tiobe";
	type = type === "webserver" ? "netcraft" : type === "db" ? "db-engines" : type;
	const rootUrl = "https://hellogithub.com";
	const currentUrl = `${rootUrl}/report/${type}`;
	const data = (await got_default({
		method: "get",
		url: `${rootUrl}/_next/data/${(await got_default({
			method: "get",
			url: rootUrl
		})).data.match(/"buildId":"(.*?)",/)[1]}/zh/report/${type}.json`
	})).data.pageProps;
	const items = [{
		guid: `${type}:${data.year}${data.month}`,
		title: `${data.year}年${data.month}月${types[type]}排行榜`,
		link: currentUrl,
		pubDate: parseDate(`${data.year}-${data.month}`, "YYYY-M"),
		description: renderReport({
			tiobeList: type === "tiobe" ? data.list : void 0,
			activeList: data.active_list,
			allList: data.all_list,
			dbList: type === "db-engines" ? data.list : void 0
		})
	}];
	return {
		title: `HelloGitHub - ${types[type]}排行榜`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
