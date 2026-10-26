import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as getData } from "./utils-Bk2VG0Hs.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/tencent/news/coronavirus/total.tsx
const route = {
	path: "/news/coronavirus/total",
	radar: [{ source: ["new.qq.com/zt2020/page/feiyan.htm"] }],
	name: "Unknown",
	maintainers: ["CaoMeiYouRen"],
	handler,
	url: "new.qq.com/zt2020/page/feiyan.htm"
};
async function handler() {
	const title = "腾讯新闻 - 新型冠状病毒肺炎疫情实时追踪";
	const link = "https://news.qq.com/zt2020/page/feiyan.htm#/";
	const item = [];
	const { localConfirmH5, localWzzAdd, confirmAdd, localConfirm, nowLocalWzz, highRiskAreaNum, mtime } = (await getData(["diseaseh5Shelf"]))?.data?.diseaseh5Shelf?.chinaTotal || {};
	const pubDate = parseDate(mtime);
	const info = {
		title: "中国本土数据统计",
		description: renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
			/* @__PURE__ */ jsx("p", { children: "本土确诊：" }),
			/* @__PURE__ */ jsx("p", { children: `+${localConfirmH5}` }),
			/* @__PURE__ */ jsx("br", {}),
			/* @__PURE__ */ jsx("p", { children: "本土无症状：" }),
			/* @__PURE__ */ jsx("p", { children: `+${localWzzAdd}` }),
			/* @__PURE__ */ jsx("br", {}),
			/* @__PURE__ */ jsx("p", { children: "确诊病例：" }),
			/* @__PURE__ */ jsx("p", { children: `+${confirmAdd}` }),
			/* @__PURE__ */ jsx("br", {}),
			/* @__PURE__ */ jsx("p", { children: "现有本土确诊：" }),
			/* @__PURE__ */ jsx("p", { children: localConfirm }),
			/* @__PURE__ */ jsx("br", {}),
			/* @__PURE__ */ jsx("p", { children: "现有本土无症状：" }),
			/* @__PURE__ */ jsx("p", { children: nowLocalWzz }),
			/* @__PURE__ */ jsx("br", {}),
			/* @__PURE__ */ jsx("p", { children: "高风险地区：" }),
			/* @__PURE__ */ jsx("p", { children: highRiskAreaNum }),
			/* @__PURE__ */ jsx("br", {})
		] })),
		pubDate,
		guid: `${link}total?pubDate=${pubDate.toISOString()}`
	};
	item.push(info);
	return {
		title,
		link,
		item
	};
}
//#endregion
export { route };
