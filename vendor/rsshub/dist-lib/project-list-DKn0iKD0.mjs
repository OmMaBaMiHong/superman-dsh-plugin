import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/cdzjryb/project-list.tsx
const route = {
	path: "/zw/projectList",
	categories: ["other"],
	example: "/cdzjryb/zw/projectList",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["zw.cdzjryb.com/lottery/accept/projectList", "zw.cdzjryb.com/"] }],
	name: "商品住房购房登记",
	maintainers: ["TonyRL"],
	handler,
	url: "zw.cdzjryb.com/lottery/accept/projectList"
};
async function handler() {
	const url = "https://zw.cdzjryb.com/lottery/accept/projectList";
	const { data: response } = await got_default(url);
	const $ = load(response);
	const list = $("#_projectInfo tr").toArray().map((item) => $(item).find("td").toArray().map((td) => $(td).text().trim()));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(`cdzjryb:zw:projectList${item[0]}`, async () => {
		const { data: notice } = await got_default.post("https://zw.cdzjryb.com/lottery/accept/getProjectRule", { form: { projectUuid: item[0] } });
		return {
			title: item[3],
			description: renderToString(/* @__PURE__ */ jsx(ProjectListDescription, {
				item,
				notice: notice.message
			})),
			link: url,
			guid: `cdzjryb:zw:projectList:${item[0]}`,
			pubDate: timezone(parseDate(item[8]), 8)
		};
	})));
	return {
		title: $("head title").text(),
		link: url,
		item: items
	};
}
const ProjectListDescription = ({ item, notice }) => {
	const details = item.slice(2, -1);
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsxs("table", { children: [/* @__PURE__ */ jsxs("tr", { children: [
			/* @__PURE__ */ jsx("th", { children: "区域" }),
			/* @__PURE__ */ jsx("th", { children: "项目名称" }),
			/* @__PURE__ */ jsx("th", { children: "预售证号" }),
			/* @__PURE__ */ jsx("th", { children: "预售范围" }),
			/* @__PURE__ */ jsx("th", { children: "住房套数" }),
			/* @__PURE__ */ jsx("th", { children: "开发商咨询电话" }),
			/* @__PURE__ */ jsx("th", { children: "登记开始时间" }),
			/* @__PURE__ */ jsx("th", { children: "登记结束时间" }),
			/* @__PURE__ */ jsx("th", { children: "名单外人员资格已释放时间" }),
			/* @__PURE__ */ jsx("th", { children: "名单内人员资格已释放时间" }),
			/* @__PURE__ */ jsx("th", { children: "预审码取得截止时间" }),
			/* @__PURE__ */ jsx("th", { children: "项目报名状态" })
		] }), /* @__PURE__ */ jsx("tr", { children: details.map((value) => /* @__PURE__ */ jsx("td", { children: value })) })] }),
		/* @__PURE__ */ jsx("h2", {
			style: "text-align: center;",
			children: "登记规则"
		}),
		raw(notice)
	] });
};
//#endregion
export { route };
