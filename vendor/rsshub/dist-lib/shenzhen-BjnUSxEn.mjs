import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/tingshuitz/shenzhen.tsx
const route = {
	path: "/shenzhen",
	categories: ["forecast"],
	example: "/tingshuitz/shenzhen",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["sz-water.com.cn/*"] }],
	name: "深圳市",
	maintainers: ["lilPiper"],
	handler,
	url: "sz-water.com.cn/*",
	description: "可能仅限中国大陆服务器访问，以实际情况为准。"
};
async function handler() {
	return {
		title: "停水通知 - 深圳水务",
		link: "https://www.sz-water.com.cn/",
		item: (await got_default({
			method: "get",
			url: "https://szgk.sz-water.com.cn/api/wechat/op/getStopWaterNotice"
		})).data.data.map((item) => ({
			title: `${item.position}${item.stoptime}`,
			description: renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("p", { children: item.title }), /* @__PURE__ */ jsxs("p", { children: [
				item.reginName ? `【${item.reginName}】` : null,
				"(影响用户",
				item.affectUser,
				"),",
				item.stopwaterType ? ` [${item.stopwaterType}]` : null,
				"原因：",
				item.reason,
				",停水开始时间",
				item.stopStartTime,
				",停水结束时间",
				item.stopEndTime
			] })] })),
			pubDate: timezone(parseDate(item.createdOn, "YYYY-MM-DD HH:mm:ss"), 8),
			link: "https://szgk.sz-water.com.cn/wechat_web/Water_stop.html",
			guid: `${item.position}${item.stopStartTime}`
		}))
	};
}
//#endregion
export { route };
