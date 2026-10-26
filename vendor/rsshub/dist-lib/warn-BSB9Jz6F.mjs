import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import sanitizeHtml from "sanitize-html";
//#region lib/routes/soweather/warn.ts
const rootUrl = "https://wx.soweather.com";
const pageUrl = `${rootUrl}/wxapp/warn.jsp`;
const dataUrl = `${rootUrl}/wxapp/jsondata/warn.js`;
const specialIssuers = /* @__PURE__ */ new Set([
	"上海市民防办",
	"中国铁路上海局集团有限公司上海站",
	"上海申通地铁集团有限公司",
	"市交通委指挥中心"
]);
const warningGroups = [
	["市级预警", "warns"],
	["市级历史预警", "historywarns"],
	["分区预警", "fqwarns"],
	["分区历史预警", "fqhistorywarns"]
];
async function handler() {
	const response = await cache_default.tryGet(`soweather:warn:${dataUrl}`, () => rofetch(dataUrl, { parseResponse: (txt) => txt }), config.cache.routeExpire, false);
	const warnings = warningGroups.flatMap(([groupName, variableName]) => parseWarnings(response, variableName).filter((warning) => isRealWarning(warning)).map((warning) => buildItem(warning, groupName)));
	return {
		title: "上海天气预警",
		description: "上海天气预警",
		link: pageUrl,
		item: warnings,
		language: "zh-CN"
	};
}
const route = {
	path: "/warn",
	name: "Shanghai Weather Alert",
	url: "wx.soweather.com/wxapp/warn.jsp",
	maintainers: ["TinkoLiu"],
	example: "/soweather/warn",
	categories: ["forecast"],
	handler,
	zh: {
		name: "上海天气预警",
		example: "/soweather/warn",
		path: "/warn",
		maintainers: ["TinkoLiu"],
		handler
	}
};
function parseWarnings(script, variableName) {
	const json = new RegExp(`var\\s+${variableName}\\s*=\\s*(\\[[\\s\\S]*?\\])\\s*(?=var\\s+\\w+\\s*=|$)`).exec(script)?.[1];
	return json ? JSON.parse(json) : [];
}
function isRealWarning(warning) {
	return !["Exercise", "Test"].includes(warning.gtyjstatus ?? "");
}
function buildItem(warning, groupName) {
	const title = buildTitle(warning);
	const content = buildContent(warning);
	const guid = `${warning.district}-${warning.id}-${warning.yjid}`;
	const image = warning.icon ? `${rootUrl}/wxapp/images/icon/${warning.icon.replaceAll("-", "_")}` : void 0;
	const updated = !warning.isActive && warning.jcsj ? timezone(parseDate(warning.jcsj, "YYYY-MM-DD HH:mm"), 8) : void 0;
	return {
		title,
		link: `${pageUrl}#${encodeURIComponent(guid)}`,
		guid,
		description: content,
		content: {
			html: content,
			text: content.replaceAll(/<br\s*\/?>/gi, "\n").replaceAll(/<[^>]+>/g, "").trim()
		},
		pubDate: timezone(parseDate(warning.fbsj, "YYYY-MM-DD HH:mm"), 8),
		updated,
		author: warning.yjfbdw,
		category: [
			groupName,
			warning.district,
			warning.name,
			warning.isActive ? "生效中" : "已解除"
		],
		image
	};
}
function buildTitle(warning) {
	const suffix = specialIssuers.has(warning.yjfbdw) ? "" : "预警";
	return `${warning.isActive ? "" : "【已解除】"}${warning.yjfbdw}${warning.yjfbtype}${warning.name}${suffix}`;
}
function buildContent(warning) {
	return [
		!warning.isActive && warning.jcsj ? `解除时间：${warning.jcsj}<br>` : "",
		sanitizeHtml(getWarningInfo(warning.htmlword), {
			allowedTags: [...sanitizeHtml.defaults.allowedTags, "br"],
			allowedAttributes: {}
		}),
		warning.lqImage1 ? `<p><img src="${new URL(warning.lqImage1.replaceAll("\\", "/"), `${rootUrl}/wxapp/`).href}"></p>` : ""
	].join("");
}
function getWarningInfo(htmlword) {
	return htmlword.split("防御指引", 1)[0].replaceAll(/(?:(?:\s|&nbsp;)*<br\s*\/?>)+\s*$/gi, "").trim();
}
//#endregion
export { route };
