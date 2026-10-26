import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/gov/safe/util.tsx
const rootUrl = "https://www.safe.gov.cn";
const zxfkCategoryApis = {
	ywzx: "www/busines/businessQuery?siteid=",
	tsjy: "www/complaint/complaintQuery?siteid="
};
const processZxfkItems = async (site = "beijing", category = "ywzx", limit = "3") => {
	const apiUrl = new URL(`${zxfkCategoryApis[category]}${site}`, rootUrl).href;
	const currentUrl = new URL(`${site}/${category}/index.html`, rootUrl).href;
	const { data: response } = await got_default(apiUrl);
	const $ = load(response);
	const items = $("#complaint").slice(0, limit).toArray().map((item) => {
		item = $(item);
		const spans = item.find("span[objid]");
		const message = {
			author: spans.first().text().replace(/:$/, ""),
			content: spans.eq(1).text(),
			date: spans.eq(2).text()
		};
		const reply = {
			author: spans.eq(3).text().replace(/:$/, ""),
			content: spans.eq(4).text(),
			date: spans.eq(5).text()
		};
		return {
			title: `${message.author}: ${message.content}`,
			link: currentUrl,
			description: renderToString(/* @__PURE__ */ jsx("table", { children: /* @__PURE__ */ jsxs("tbody", { children: [
				/* @__PURE__ */ jsxs("tr", { children: [
					/* @__PURE__ */ jsx("th", { children: "留言人" }),
					/* @__PURE__ */ jsx("th", { children: "留言内容" }),
					/* @__PURE__ */ jsx("th", { children: "留言时间" })
				] }),
				message ? /* @__PURE__ */ jsxs("tr", { children: [
					/* @__PURE__ */ jsx("td", { children: message.author }),
					/* @__PURE__ */ jsx("td", { children: message.content }),
					/* @__PURE__ */ jsx("td", { children: message.date })
				] }) : null,
				reply ? /* @__PURE__ */ jsxs("tr", {
					style: { color: "#0069ae" },
					children: [
						/* @__PURE__ */ jsx("td", { children: reply.author }),
						/* @__PURE__ */ jsx("td", { children: reply.content }),
						/* @__PURE__ */ jsx("td", { children: reply.date })
					]
				}) : null
			] }) })),
			author: `${message.author}/${reply.author}`,
			guid: `${currentUrl}#${message.author}(${message.date})/${reply.author}(${reply.date})`,
			pubDate: parseDate(message.date),
			updated: parseDate(reply.date)
		};
	});
	const { data: currentResponse } = await got_default(currentUrl);
	const content = load(currentResponse);
	const author = content("meta[name=\"ColumnName\"]").prop("content");
	const subtitle = content("meta[name=\"ColumnType\"]").prop("content");
	const imagePath = "safe/templateresource/372b1dfdab204181b9b4f943a8e926a6";
	const image = new URL(`${imagePath}/logo_06.png`, rootUrl).href;
	const icon = new URL(`${imagePath}/safe.ico`, rootUrl).href;
	return {
		item: items,
		title: `${author} - ${subtitle}`,
		link: currentUrl,
		description: content("meta[name=\"ColumnDescription\"]").prop("content"),
		language: "zh",
		image,
		icon,
		logo: icon,
		subtitle,
		author,
		allowEmpty: true
	};
};
//#endregion
export { processZxfkItems as t };
