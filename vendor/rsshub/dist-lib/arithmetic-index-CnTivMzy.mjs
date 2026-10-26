import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { n as outPlaywright } from "./playwright-DGfbX7qN.mjs";
import dayjs from "dayjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createDecipheriv } from "node:crypto";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/oceanengine/arithmetic-index.tsx
const CACHE_MAX_AGE = config.cache.contentExpire;
const DEFAULT_FETCH_DURATION_MONTH = 6;
const getMultiKeywordHotTrend = async (page, keyword, start_date, end_date, app_name = "aweme") => {
	const e = {
		url: "https://trendinsight.oceanengine.com/api/open/index/get_multi_keyword_hot_trend",
		method: "POST",
		data: JSON.stringify({
			keyword_list: [keyword],
			start_date,
			end_date,
			app_name
		})
	};
	return (await page.evaluate(async (e) => {
		function queryData() {
			return new Promise((resolve) => {
				const req = new XMLHttpRequest();
				req.open(e.method, e.url, true);
				req.setRequestHeader("accept", "application/json, text/plain, */*");
				req.setRequestHeader("content-type", "application/json;charset=UTF-8");
				req.setRequestHeader("tea-uid", "7054893410171930123");
				req.addEventListener("readystatechange", () => {
					if (req.readyState === 4 && req.status === 200) resolve(req.responseText);
					else return;
				});
				req.send(e.data);
			});
		}
		return await queryData();
	}, e))[0];
};
const key = "anN2bXA2NjYsamlh";
const iv = "amlheW91LHFpYW53";
const algorithm = "aes-128-cfb";
const decrypt = (rawData) => {
	const encrypted = Buffer.from(rawData, "base64").toString("hex");
	const decipher = createDecipheriv(algorithm, key, iv);
	const decrypted = decipher.update(encrypted, "hex", "utf8") + decipher.final("utf8");
	return JSON.parse(decrypted);
};
const searchLinkUrls = (keyword) => [
	`https://tophub.today/search?e=tophub&q=${keyword}`,
	`https://www.baidu.com/s?wd=${keyword}`,
	`https://www.google.com/search?q=${keyword}`,
	`https://m.zhihu.com/search?type=content&q=${keyword}`,
	`https://s.weibo.com/weibo/${keyword}`,
	`https://www.douyin.com/search/${keyword}`,
	`https://so.toutiao.com/search?keyword=${keyword}`
];
const searchLinkNames = [
	"今日热榜",
	"百度",
	"谷歌",
	"知乎",
	"微博",
	"抖音",
	"头条"
];
const createContent = (keyword, queryList, queryListText) => renderToString(/* @__PURE__ */ jsx(OceanengineContent, {
	keyword,
	queryListText,
	queries: queryList.map((query) => ({
		links: searchLinkUrls(encodeURIComponent(query)).map((url, index) => `<a href="${url}" rel="noopener noreferrer" target="_blank">${searchLinkNames[index]}</a>`),
		key: query
	}))
}));
const route = {
	path: "/index/:keyword/:channel?",
	name: "Unknown",
	maintainers: ["Jkker"],
	handler
};
async function handler(ctx) {
	const now = dayjs();
	const start_date = now.subtract(DEFAULT_FETCH_DURATION_MONTH, "month").format("YYYYMMDD");
	const end_date = now.format("YYYYMMDD");
	const keyword = ctx.req.param("keyword");
	if (!keyword) throw new InvalidParameterError("Invalid keyword");
	if (ctx.req.param("channel") && !["douyin", "toutiao"].includes(ctx.req.param("channel"))) throw new InvalidParameterError("Invalid channel。 Only support `douyin` or `toutiao`");
	const channel = ctx.req.param("channel") === "toutiao" ? "toutiao" : "aweme";
	const channelName = ctx.req.param("channel") === "toutiao" ? "头条" : "抖音";
	const link = `https://trendinsight.oceanengine.com/arithmetic-index/analysis?keyword=${keyword}&appName=${channel}`;
	const item = await cache_default.tryGet(link, async () => {
		const context = await outPlaywright();
		const page = await context.newPage();
		await page.route("**/*", (route) => {
			const request = route.request();
			request.resourceType() === "document" || request.resourceType() === "script" || request.resourceType() === "xhr" ? route.continue() : route.abort();
		});
		await page.goto("https://trendinsight.oceanengine.com/arithmetic-index");
		const res = await getMultiKeywordHotTrend(page, keyword, start_date, end_date, channel);
		await context.close();
		const rawData = JSON.parse(res).data;
		const data = decrypt(rawData).hot_list[0];
		const searchAverage = Number.parseInt(data.average.search_average);
		return data.search_top_point_list.map(({ date, query_list }) => {
			const searchIndex = Number.parseInt(data.search_hot_list.find((listItem) => listItem.datetime === date).index);
			const relativePercent = Math.round((searchIndex - searchAverage) / searchAverage * 100);
			const icon = relativePercent > 0 ? "📈" : "📉";
			const uniqueQueryList = query_list.filter((query) => query !== keyword);
			const uniqueQueryListStr = uniqueQueryList.join(", ");
			const content = createContent(keyword, [keyword, ...uniqueQueryList], uniqueQueryListStr);
			return {
				title: `${icon} ${keyword} ${relativePercent}% | ${uniqueQueryListStr}`,
				author: `巨量算数 - ${channelName}算数指数`,
				description: content,
				link,
				pubDate: timezone(parseDate(date), 8),
				guid: `巨量算数 - ${channelName}算数指数 | ${keyword} - ${date}`
			};
		});
	}, CACHE_MAX_AGE, false);
	return {
		title: `${keyword} - ${channelName}指数波峰`,
		link,
		description: `巨量算数 - ${channelName}算数指数 | 关键词: ${keyword}`,
		language: "zh-cn",
		item
	};
}
const OceanengineContent = ({ queryListText, queries }) => /* @__PURE__ */ jsxs("article", { children: [
	/* @__PURE__ */ jsx("h2", { children: "关键词: " }),
	queryListText,
	"\xA0\xA0\xA0\xA0\xA0",
	/* @__PURE__ */ jsx("br", {}),
	queries.map((query) => /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("h2", { children: query.key }), /* @__PURE__ */ jsx("p", { children: query.links.map((link) => /* @__PURE__ */ jsxs(Fragment, { children: [raw(link), "\xA0\xA0"] })) })] }))
] });
//#endregion
export { route };
