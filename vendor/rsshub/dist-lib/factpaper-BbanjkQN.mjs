import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/thepaper/factpaper.tsx
const route = {
	path: "/factpaper/:status?",
	categories: ["new-media"],
	example: "/thepaper/factpaper",
	parameters: { status: "状态 id，可选 `1` 即 有定论 或 `0` 即 核查中，默认为 `1`" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["factpaper.cn/"],
		target: "/factpaper/:status"
	}],
	name: "明查",
	maintainers: ["nczitzk"],
	handler,
	url: "factpaper.cn/"
};
async function handler(ctx) {
	const status = Number.parseInt(ctx.req.param("status") ?? "1");
	const rootUrl = "https://www.factpaper.cn";
	const apiRootUrl = "https://api.factpaper.cn";
	let items = (await got_default({
		method: "post",
		url: `${apiRootUrl}/fact-check/front/proveList`,
		json: {
			pageNum: 1,
			pageSize: 20,
			status
		}
	})).data.data.list.map((item) => ({
		title: item.title,
		guid: item.proveId,
		link: `${rootUrl}/detail?id=${item.proveId}`,
		pubDate: timezone(parseDate(item.publishTime), 8)
	}));
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const data = (await got_default({
			method: "post",
			url: `${apiRootUrl}/fact-check/front/proveInfo`,
			json: { proveId: item.guid }
		})).data.data;
		item.author = data.userName;
		item.description = renderToString(/* @__PURE__ */ jsx(FactpaperDescription, {
			content: data.content,
			checkinfo: data.checkInfoList,
			finalCheckInfo: data.finalCheckInfo
		}));
		return item;
	})));
	return {
		title: `澎湃明查 - ${status === 1 ? "有定论" : "核查中"}`,
		link: rootUrl,
		item: items
	};
}
const FactpaperDescription = ({ content, checkinfo, finalCheckInfo }) => /* @__PURE__ */ jsxs(Fragment, { children: [
	/* @__PURE__ */ jsx("h1", { children: "发起求证" }),
	raw(content),
	checkinfo?.length ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("h1", { children: "一起核查" }), checkinfo.map((check) => raw(check.content))] }) : null,
	finalCheckInfo ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("h1", { children: "有定论了" }), raw(finalCheckInfo.content)] }) : null
] });
//#endregion
export { route };
