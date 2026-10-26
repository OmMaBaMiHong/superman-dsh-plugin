import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/elamigos/index.ts
const route = {
	path: "/games",
	categories: ["game"],
	example: "/elamigos/games",
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
		source: ["elamigos.site/", "elamigos.site/index.html"],
		target: "/games"
	}],
	name: "Releases",
	maintainers: ["Kylon92"],
	handler,
	description: "Latest game releases from ElAmigos"
};
async function handler(ctx) {
	const limit = Number(ctx.req.query("limit")) || 40;
	const baseUrl = "https://elamigos.site";
	const { data: html } = await got_default(baseUrl);
	const games = extractGames(load(html), limit, baseUrl);
	const items = await Promise.all(games.map((game) => processGameItem(game)));
	return {
		title: "ElAmigos - Latest Games",
		link: baseUrl,
		description: `Latest game releases from ElAmigos (${items.length} entries)`,
		item: items
	};
}
function toNeutralDate(input, appendDay = false) {
	const [day, month, year] = input.split(".").map(Number);
	const baseDate = new Date(Date.UTC(year, month - 1, day));
	return appendDay ? new Date(baseDate.getTime() + 1440 * 60 * 1e3) : baseDate;
}
function extractGames($, limit, baseUrl) {
	const dateRegex = /^\d{2}\.\d{2}\.\d{4}/;
	const games = [];
	let arrivedAtGameSection = false;
	$("h1, h3, h5").each((_, elem) => {
		const $elem = $(elem);
		const tagName = elem.tagName.toLowerCase();
		if (tagName === "h1") {
			const match = $elem.text().trim().match(dateRegex);
			if (!match) return;
			arrivedAtGameSection = true;
			for (const game of games) if (game.pubDate === null || game.pubDate.trim() === "") game.pubDate = match[0];
		} else if ((tagName === "h3" || tagName === "h5") && arrivedAtGameSection) {
			const link = $elem.find("a[href]").first();
			if (!link.length || games.length >= limit) return;
			const href = link.attr("href");
			const title = $elem.text().replaceAll("DOWNLOAD", "").trim();
			const fullLink = href.startsWith("http") ? href : `${baseUrl}/${href.replace(/^\//, "")}`;
			games.push({
				title,
				link: fullLink,
				pubDate: null
			});
		}
	});
	return games;
}
function extractLatestDate(pageHtml) {
	const dateMatches = pageHtml.match(/\b\d{2}\.\d{2}\.\d{4}\b/g) || [];
	const uniqueDates = [...new Set(dateMatches)];
	let newestDate = null;
	for (const dateStr of uniqueDates) {
		const parsedDate = toNeutralDate(dateStr);
		if (newestDate === null || parsedDate > newestDate) newestDate = parsedDate;
	}
	return newestDate;
}
function sanitizeHtml(pageHtml) {
	const $page = load(pageHtml);
	$page("script, style, link, nav").remove();
	$page("*").each((_, elem) => {
		if (!elem.attribs) return;
		const attributes = Object.keys(elem.attribs);
		for (const attr of attributes) if (attr.toLowerCase().startsWith("on")) $page(elem).removeAttr(attr);
	});
	let contentHtml = $page("body").html() || "";
	contentHtml = contentHtml.replaceAll(/^\s*[\r\n]/gm, "").replaceAll(/body\s*\{\s*margin-top:\s*1em;\s*\}/gi, "").trim();
	return contentHtml;
}
function processGameItem(game) {
	const cacheKey = `elamigos:${game.link}`;
	return cache_default.tryGet(cacheKey, async () => {
		try {
			const { data: pageHtml } = await got_default(game.link);
			const newestDate = extractLatestDate(pageHtml);
			let finalPublishDate = null;
			if (game.pubDate) finalPublishDate = toNeutralDate(game.pubDate, true);
			if (finalPublishDate === null || newestDate !== null && newestDate > finalPublishDate) finalPublishDate = newestDate;
			const contentHtml = sanitizeHtml(pageHtml);
			return {
				title: game.title,
				link: game.link,
				pubDate: finalPublishDate === null ? void 0 : finalPublishDate.toUTCString(),
				description: contentHtml
			};
		} catch {
			return {
				title: game.title,
				link: game.link,
				description: `<p>View game page: <a href="${game.link}">${game.link}</a></p>`
			};
		}
	});
}
//#endregion
export { route };
