import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/ai-bot/daily-ai-news.ts
function parseDateString(dateStr, ctx) {
	const match = dateStr.match(/(\d+)月(\d+)/);
	if (!match) return;
	const month = Number(match[1]);
	const day = Number(match[2]);
	if (ctx.prevMonth > 0 && (month > ctx.prevMonth || month === ctx.prevMonth && day > ctx.prevDay)) ctx.currentYear--;
	ctx.prevMonth = month;
	ctx.prevDay = day;
	return timezone(parseDate(`${ctx.currentYear}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`), 8);
}
function processNewsList($, $newsList, ctx) {
	let currentPubDate;
	return $newsList.children().toArray().flatMap((child) => {
		const $child = $(child);
		if ($child.hasClass("news-date")) {
			currentPubDate = parseDateString($child.text().trim(), ctx);
			return [];
		}
		if ($child.hasClass("news-item") && currentPubDate) {
			const $link = $child.find("h2 a");
			const title = $link.text().trim();
			const link = $link.attr("href");
			const description = $child.find("p.text-muted").html() || "";
			if (!link) return [];
			return {
				title,
				link,
				guid: link,
				description,
				pubDate: currentPubDate,
				author: "AI工具集"
			};
		}
		if ($child.hasClass("news-list")) return processNewsList($, $child, ctx);
		return [];
	});
}
async function handler() {
	const $ = load(await rofetch("https://ai-bot.cn/daily-ai-news/"));
	return {
		title: "每日AI资讯 | AI工具集",
		link: "https://ai-bot.cn/daily-ai-news/",
		item: processNewsList($, $(".news-list").first(), {
			currentYear: (/* @__PURE__ */ new Date()).getFullYear(),
			prevMonth: 0,
			prevDay: 0
		})
	};
}
const route = {
	path: "/daily-ai-news",
	categories: ["new-media"],
	example: "/ai-bot/daily-ai-news",
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
		source: ["ai-bot.cn/daily-ai-news", "ai-bot.cn/daily-ai-news/"],
		target: "/daily-ai-news"
	}],
	name: "每日AI资讯",
	maintainers: ["redwood9"],
	handler,
	url: "ai-bot.cn/daily-ai-news",
	description: "获取 AI 工具集网站的每日 AI 资讯汇总。"
};
//#endregion
export { route };
