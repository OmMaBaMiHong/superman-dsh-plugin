import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/scitechvista/namespace.ts
const namespace = {
	name: "科技大觀園",
	url: "scitechvista.nat.gov.tw",
	lang: "zh-TW"
};
//#endregion
//#region lib/routes/scitechvista/index.tsx
const baseUrl = `https://${namespace.url}`;
function parseRocDate(rocDate) {
	if (!rocDate) return;
	const parts = rocDate.trim().split("/");
	if (parts.length !== 3) return;
	const [rocYearStr, monthStr, dayStr] = parts;
	return parseDate(`${Number(rocYearStr) + 1911}-${monthStr}-${dayStr}`, "YYYY-MM-DD");
}
const route = {
	path: "/",
	categories: ["government"],
	example: "/scitechvista",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["scitechvista.nat.gov.tw/"] }],
	name: "最新文章",
	maintainers: ["johan456789"],
	handler,
	url: namespace.url
};
async function handler() {
	const currentUrl = `${baseUrl}/Article/C000003/new`;
	const $ = load(await rofetch(currentUrl));
	const language = $("html").attr("lang") || "zh-TW";
	const items = $("div.kf-diagramtext-list > div.kf-diagramtext-col").toArray().map((colEl) => {
		const node = $(colEl);
		const linkPath = node.find("a[href*=\"/Article/C000003/detail\"]").attr("href");
		const link = linkPath ? new URL(linkPath, baseUrl).href : void 0;
		const title = node.find("div.kf-title").text().trim();
		const dateText = node.find("div.kf-date > span").text().trim();
		const pubDate = dateText ? timezone(parseRocDate(dateText), 8) : void 0;
		const imagePath = node.find("img").attr("src");
		const image = imagePath ? new URL(imagePath, baseUrl).href : void 0;
		const snippet = node.find("div.kf-txt").text().trim();
		return {
			title,
			description: renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [image ? /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("img", {
				src: image,
				alt: ""
			}) }) : null, snippet ? /* @__PURE__ */ jsx("p", { children: raw(snippet) }) : null] })),
			link,
			pubDate,
			image
		};
	}).filter(Boolean);
	return {
		title: `${namespace.name} - 最新文章`,
		link: currentUrl,
		language,
		item: items
	};
}
//#endregion
export { route };
