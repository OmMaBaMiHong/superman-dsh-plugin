import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/fjdaily/index.ts
const ROOT_URL = "https://fjrb.fjdaily.com";
const removeComments = (element) => {
	element.contents().filter((_, node) => node.type === "comment").remove();
	element.find("*").contents().filter((_, node) => node.type === "comment").remove();
};
const getNormalizedHtml = (element) => {
	removeComments(element);
	element.find("img, video, audio, source").removeAttr("referrerpolicy");
	return element.html()?.trim();
};
const hasMeaningfulContent = (element) => {
	const text = element.text().replaceAll(/\s+/g, "");
	const media = element.find("img, video, audio, source").length;
	return text.length > 0 || media > 0;
};
const getDescription = (element) => {
	const normalizedHtml = getNormalizedHtml(element);
	if (!normalizedHtml || !hasMeaningfulContent(element)) return;
	return normalizedHtml;
};
const getNodeSrc = (node) => node.attribs?.src;
const getAttachmentDescription = (attachment) => getDescription(attachment);
const getNewMediaHtml = (detail, attachment, mainMediaSources) => attachment.find("img, video, audio, source").toArray().filter((item) => {
	const src = getNodeSrc(item);
	return src && !mainMediaSources.has(src);
}).map((item) => detail(item).prop("outerHTML")).filter(Boolean).join("");
const mergeDescription = (detail, mainDescription, attachment, mainMediaSources) => {
	if (!mainDescription) return getAttachmentDescription(attachment);
	const newMediaHtml = getNewMediaHtml(detail, attachment, mainMediaSources);
	return newMediaHtml ? `${newMediaHtml}${mainDescription}` : mainDescription;
};
const getItemDescription = (detail) => {
	const mainContent = detail("#content");
	const attachment = detail(".attachment");
	const mainDescription = getDescription(mainContent);
	const mainMediaSources = new Set(mainContent.find("img, video, audio, source").toArray().map((item) => getNodeSrc(item)).filter(Boolean));
	return mergeDescription(detail, mainDescription, attachment, mainMediaSources);
};
const getIssueDate = async (date) => {
	if (date) {
		if (!/^\d{8}$/.test(date)) throw new Error("Invalid date format. Expected YYYYMMDD, for example `20260316`. ");
		return {
			yearMonth: date.slice(0, 6),
			day: date.slice(6, 8)
		};
	}
	const latestPath = load((await got_default(`${ROOT_URL}/pc/col/index.html`)).data)("#list li:first-child a").attr("href");
	if (!latestPath) throw new Error("Failed to locate the latest Fujian Daily edition.");
	const [, yearMonth, day] = latestPath.match(/(\d{6})\/(\d{2})\/node_\d+\.html/) ?? [];
	if (!yearMonth || !day) throw new Error("Failed to parse the latest Fujian Daily edition date.");
	return {
		yearMonth,
		day
	};
};
const route = {
	path: "/:date?",
	categories: ["traditional-media"],
	example: "/fjdaily/20260316",
	parameters: { date: "日期，格式为 `YYYYMMDD`，留空时抓取当天全部版面，例如 `20260316`" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["fjrb.fjdaily.com/pc/col/index.html"],
		target: "/"
	}, { source: ["fjrb.fjdaily.com/pc/col/:yearmonth/:day/node_:id.html"] }],
	name: "电子报",
	maintainers: ["DakoWang"],
	handler,
	description: "留空时抓取最新一期全部版面，也可以通过日期参数抓取指定日期的全部版面内容。"
};
async function handler(ctx) {
	const date = ctx.req.param("date");
	const { yearMonth, day } = await getIssueDate(date);
	const padUrl = `${ROOT_URL}/pad/col/${yearMonth}/${day}/node_01.html`;
	const pageUrl = `${ROOT_URL}/pc/col/${yearMonth}/${day}/node_01.html`;
	const content = load((await got_default(padUrl)).data);
	let currentCategory = "";
	const list = content("#catalog li").toArray().map((item) => {
		const element = content(item);
		if (element.hasClass("verson")) {
			currentCategory = element.text().replaceAll(/\s+/g, " ").trim();
			return;
		}
		const a = element.find("a").first();
		const href = a.attr("href");
		if (!href) return;
		return {
			title: a.text().replaceAll(/\s+/g, " ").trim(),
			link: new URL(href, padUrl).href.replace("/pad/", "/pc/"),
			category: [currentCategory.replace(/^\d+版\s*/, "")]
		};
	}).filter((item) => item !== void 0);
	if (list.length === 0) throw new Error(`No articles were found for ${yearMonth}${day}.`);
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const detail = load((await got_default(item.link)).data);
		const pubDate = detail("#NewsArticlePubDay").text().trim();
		const author = detail("#NewsArticleAuthor").text().trim();
		const description = getItemDescription(detail);
		return {
			...item,
			author: author || void 0,
			description: description || void 0,
			pubDate: pubDate ? timezone(parseDate(pubDate), 8) : void 0
		};
	})));
	return {
		title: `福建日报 - ${yearMonth.slice(0, 4)}-${yearMonth.slice(4, 6)}-${day}`,
		link: pageUrl,
		item: items
	};
}
//#endregion
export { route };
