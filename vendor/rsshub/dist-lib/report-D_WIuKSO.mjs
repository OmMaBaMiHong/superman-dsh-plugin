import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { n as parseRelativeDate } from "./parse-date-Cr0wQjV_.mjs";
import * as cheerio from "cheerio";
//#region lib/routes/zhizhuan100/report.ts
const route = {
	path: "/analytic",
	categories: ["finance"],
	view: 0,
	example: "/zhizhuan100/analytic",
	radar: [{ source: ["www.zhizhuan100.com.cn/analysis"] }],
	name: "analytic",
	maintainers: ["Cedaric"],
	handler
};
async function handler() {
	const urlData = await rofetch("https://www.zhizhuan100.com.cn/analysis");
	const bodyJsUrl = cheerio.load(urlData)("script[src*=\"Body.js\"]").attr("src");
	if (!bodyJsUrl) throw new Error("无法找到 Body.js 脚本文件");
	const htmlMatch = (await rofetch(bodyJsUrl, { parseResponse: (txt) => txt })).match(/document\.write\('(.*)'\);/s);
	if (!htmlMatch) throw new Error("无法找到HTML内容");
	const htmlContent = JSON.parse(`"${htmlMatch[1]}"`);
	const $content = cheerio.load(htmlContent);
	return {
		title: "智篆商业-消费报告",
		link: "https://www.zhizhuan100.com.cn/analysis",
		allowEmpty: true,
		item: $content(".w-list-item").toArray().map((item) => {
			const $item = $content(item);
			const titleElement = $item.find(".w-list-title");
			const dateElement = $item.find(".w-list-date");
			const linkElement = $item.find(".w-list-link");
			const imgElement = $item.find(".w-listpic-in");
			const title = titleElement.text().trim() || "";
			const dateText = dateElement.text().trim() || "";
			const href = linkElement.attr("href") || "";
			const imgSrc = imgElement.attr("src") || "";
			const idMatch = href.match(/\/productinfo\/(\d+)\.html/);
			const id = idMatch ? idMatch[1] : "";
			return {
				title,
				pubDate: parseRelativeDate(dateText),
				link: href.startsWith("http") ? href : `https://www.zhizhuan100.com.cn${href}`,
				description: `<img src="${imgSrc.startsWith("//") ? "https:" + imgSrc : imgSrc}" alt="${title}">`,
				guid: id
			};
		}).filter((item) => item.title)
	};
}
//#endregion
export { route };
