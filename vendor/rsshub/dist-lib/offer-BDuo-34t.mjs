import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/1point3acres/offer.tsx
const route = {
	path: "/offer/:year?/:major?/:school?",
	categories: ["bbs"],
	example: "/1point3acres/offer/12/null/CMU",
	parameters: {
		year: "录取年份  id，空为null",
		major: "录取专业 id，空为null",
		school: "录取学校 id，空为null"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["offer.1point3acres.com/"],
		target: "/offer"
	}],
	name: "录取结果",
	maintainers: ["EthanWng97"],
	handler,
	url: "offer.1point3acres.com/",
	description: `::: tip 三个 id 获取方式

1. 打开 <https://offer.1point3acres.com>
2. 打开控制台
3. 切换到 Network 面板
4. 点击 搜索 按钮
5. 点击 results?ps=15\\&pg=1 POST 请求
6. 找到 Request Payload 请求参数，例如 \`filters: {planyr: "13", planmajor: "1", outname_w: "ACADIAU"}\` ，则三个 id 分别为: 13,1,ACADIAU

:::`
};
async function handler(ctx) {
	const { year = "null", major = "null", school = "null" } = ctx.req.param();
	return {
		title: "录取结果 - 一亩三分地",
		link: "https://offer.1point3acres.com",
		item: (await got_default.post("https://api.1point3acres.com/offer/results", {
			searchParams: {
				ps: 15,
				pg: 1
			},
			json: { filters: {
				planyr: year === "null" ? void 0 : year,
				planmajor: major === "null" ? void 0 : major,
				outname_w: school === "null" ? void 0 : school
			} }
		})).data.results.map((item) => ({
			title: `${item.planyr}年${item.planmajor}@${item.outname_w}：${item.result} - 一亩三分地`,
			description: renderDescription(item),
			pubDate: parseDate(item.dateline, "X"),
			link: "https://offer.1point3acres.com",
			guid: `1point3acres:offer:${year}:${major}:${school}:${item.id}`
		}))
	};
}
const renderDescription = (item) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	/* @__PURE__ */ jsx("b", { children: "国家：" }),
	item.country,
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsx("b", { children: "学校：" }),
	item.outname_w,
	" ",
	item.outname,
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsx("b", { children: "录取学位：" }),
	item.plandegree,
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsx("b", { children: "录取项目：" }),
	item.planmajor,
	" - ",
	item.planprogram,
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsx("b", { children: "录取结果：" }),
	item.result,
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsx("b", { children: "录取时间：" }),
	item.outtime,
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsx("b", { children: "通知方式：" }),
	item.noticemethod,
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsx("b", { children: "全奖/自费：" }),
	item.planfin,
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsx("b", { children: "申入学学期：" }),
	item.planterm,
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsx("b", { children: "申入学年度：" }),
	item.planyr,
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsx("b", { children: "提交时间：" }),
	item.submittime
] }));
//#endregion
export { route };
