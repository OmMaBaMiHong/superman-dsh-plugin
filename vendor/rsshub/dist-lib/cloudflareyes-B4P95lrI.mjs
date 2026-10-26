import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/hostmonit/cloudflareyes.tsx
const renderTitle = ({ line, latency, loss, speed, node, ip }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	"[",
	line,
	" | ",
	latency,
	" | ",
	loss,
	" | ",
	speed,
	" | ",
	node,
	"] ",
	ip
] }));
const renderDescription = ({ line, latency, loss, speed, node, ip }) => renderToString(/* @__PURE__ */ jsx("table", { children: /* @__PURE__ */ jsxs("tbody", { children: [
	/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "Line" }), /* @__PURE__ */ jsx("td", { children: line })] }),
	/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "Latency" }), /* @__PURE__ */ jsx("td", { children: latency })] }),
	/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "Loss" }), /* @__PURE__ */ jsx("td", { children: loss })] }),
	/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "Speed" }), /* @__PURE__ */ jsx("td", { children: speed })] }),
	/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "Node" }), /* @__PURE__ */ jsx("td", { children: node })] }),
	/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "IP" }), /* @__PURE__ */ jsx("td", { children: ip })] })
] }) }));
const lines = {
	CM: "中国移动",
	CU: "中国联通",
	CT: "中国电信"
};
const route = {
	path: "/cloudflareyes/:type?",
	categories: ["other"],
	example: "/hostmonit/cloudflareyes",
	parameters: { type: "类型，见下表，默认为 v4" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "CloudFlareYes",
	maintainers: ["nczitzk"],
	handler,
	description: `| v4 | v6 |
| -- | -- |
|    | v6 |`
};
async function handler(ctx) {
	const { type = "v4" } = ctx.req.param();
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 30;
	const domain = "hostmonit.com";
	const title = `CloudFlareYes${type === "v6" ? type.toUpperCase() : ""}`;
	const rootUrl = `https://stock.${domain}`;
	const apiUrl = new URL("get_optimization_ip", `https://api.${domain}`).href;
	const currentUrl = new URL(title, rootUrl).href;
	const { data: response } = await got_default.post(apiUrl, { json: {
		key: "iDetkOys",
		...type === "v6" && { type: "v6" }
	} });
	const items = response.info.slice(0, limit).map((item) => {
		const ip = item.ip;
		const latency = item.latency === void 0 ? void 0 : `${item.latency}ms`;
		const line = item.line === void 0 ? void 0 : Object.hasOwn(lines, item.line) ? lines[item.line] : item.line;
		const loss = item.loss === void 0 ? void 0 : `${item.loss}%`;
		const node = item.node;
		const speed = item.speed === void 0 ? void 0 : `${item.speed} KB/s`;
		const pubDate = timezone(parseDate(item.time), 8);
		return {
			title: renderTitle({
				line,
				latency,
				loss,
				speed,
				node,
				ip
			}),
			link: currentUrl,
			description: renderDescription({
				line,
				node,
				ip,
				latency,
				loss,
				speed
			}),
			author: node,
			category: [
				line,
				latency,
				loss,
				node
			].filter(Boolean),
			guid: `${domain}-${title}-${ip}#${pubDate.toISOString()}`,
			pubDate
		};
	});
	const { data: currentResponse } = await got_default(currentUrl);
	const $ = load(currentResponse);
	const icon = new URL($("link[rel=\"icon\"]").prop("href"), rootUrl).href;
	return {
		item: items,
		title: $("title").text().replace(/- .*$/, () => `- ${title}`),
		link: currentUrl,
		description: $("meta[name=\"description\"]").prop("content"),
		language: $("html").prop("lang"),
		icon,
		logo: icon,
		subtitle: title,
		author: $("title").text().split(/\s-/, 1)[0],
		allowEmpty: true
	};
}
//#endregion
export { route };
