import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/ncu/jwc.ts
const baseUrl = "https://jwc.ncu.edu.cn";
const route = {
	path: "/jwc",
	categories: ["university"],
	example: "/ncu/jwc",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["jwc.ncu.edu.cn"],
		target: "/jwc"
	}],
	name: "教务通知",
	maintainers: ["ywh555hhh", "jixiuweilan"],
	handler,
	url: "jwc.ncu.edu.cn/Notices.jsp"
};
async function handler() {
	const targetUrl = `${baseUrl}/Notices.jsp?urltype=tree.TreeTempUrl&wbtreeid=1541`;
	const $ = load(await rofetch(targetUrl));
	const list = $("div.space-y-2 div.group").toArray().map((item) => {
		const el = $(item);
		const linkEl = el.find("a").first();
		const title = linkEl.find("span.text-gray-700").text().trim() || linkEl.text().trim();
		const rawLink = linkEl.attr("href");
		const link = rawLink ? new URL(rawLink, baseUrl).href : "";
		const dateText = el.find(String.raw`.font-mono span.md\:inline`).text().trim();
		return {
			title,
			link,
			pubDate: dateText ? parseDate(dateText, "YYYY-MM-DD") : void 0
		};
	}).filter((item) => item.title && item.link);
	return {
		title: "南昌大学教务处 - 通知公告",
		link: targetUrl,
		description: "南昌大学教务处通知公告",
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const $detail = load(await rofetch(item.link));
			const contentEl = $detail(".v_news_content");
			contentEl.find("a").each((_, el) => {
				const href = $detail(el).attr("href");
				if (href && !href.startsWith("http")) $detail(el).attr("href", new URL(href, baseUrl).href);
			});
			contentEl.find("img").each((_, el) => {
				const src = $detail(el).attr("src");
				if (src && !src.startsWith("http")) $detail(el).attr("src", new URL(src, baseUrl).href);
			});
			let description = contentEl.html() || "";
			const attachments = $detail("a[href*=\"download.jsp\"]");
			if (attachments.length > 0) {
				description += "<ul>";
				attachments.each((_, el) => {
					const href = $detail(el).attr("href");
					const text = $detail(el).text().trim();
					if (href && text) {
						const absoluteHref = href.startsWith("http") ? href : new URL(href, baseUrl).href;
						description += `<li><a href="${absoluteHref}">${text}</a></li>`;
					}
				});
				description += "</ul>";
			}
			return {
				...item,
				description
			};
		})))
	};
}
//#endregion
export { route };
