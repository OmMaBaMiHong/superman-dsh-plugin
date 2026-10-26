import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
import markdownit from "markdown-it";
import Parser from "rss-parser";
//#region lib/routes/nyaa/main.ts
const md = markdownit({
	breaks: true,
	html: true,
	linkify: true,
	typographer: true
});
const route = {
	path: [
		"/search/:query?",
		"/user/:username?",
		"/user/:username/search/:query?",
		"/sukebei/search/:query?",
		"/sukebei/user/:username?",
		"/sukebei/user/:username/search/:query?"
	],
	categories: ["multimedia"],
	example: "/nyaa/search/psycho-pass",
	parameters: { query: "Search keyword" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: true,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Search Result",
	maintainers: [
		"Lava-Swimmer",
		"noname1776",
		"camera-2018",
		"Q16KBreak"
	],
	handler
};
async function handler(ctx) {
	const parser = new Parser({
		customFields: { item: ["magnet", ["nyaa:infoHash", "infoHash"]] },
		headers: { "User-Agent": config.ua }
	});
	const { query, username } = ctx.req.param();
	const rootURL = ctx.req.path.split("/", 3)[2] === "sukebei" ? "https://sukebei.nyaa.si" : "https://nyaa.si";
	let currentRSSURL = `${rootURL}/?page=rss`;
	let currentLink = `${rootURL}/`;
	if (username !== void 0) {
		currentRSSURL += `&u=${encodeURI(username)}`;
		currentLink += `user/${encodeURI(username)}`;
	}
	if (query !== void 0) {
		currentRSSURL += `&q=${encodeURI(query)}`;
		currentLink += `?q=${encodeURI(query)}`;
	}
	const feed = await parser.parseURL(currentRSSURL);
	/**
	* Shares the same `mode=fulltext` trigger condition with
	* DIYgod/RSSHub/lib/middleware/parameter.ts
	*
	* @caution
	* Due to semantic differences in Nyaa (where `link` = torrent file, `guid` = web page),
	* the middleware may trigger unnecessary requests to torrent files, and when a 429 error occurs,
	* you can observe request errors for the torrent file in the console.
	*
	* @impact
	* Does NOT affect the final RSS output. The actual fulltext is correctly fetched from `item.guid`.
	*/
	if (ctx.req.query("mode")?.toLowerCase() === "fulltext") {
		const limit = Number.parseInt(ctx.req.query("limit")) || 6;
		const items = await Promise.all(feed.items.slice(0, limit).map((item) => cache_default.tryGet(item.guid, async () => {
			const $ = load(await rofetch(item.guid));
			item.description = md.render($("div#torrent-description.panel-body[markdown-text]").text());
			item.enclosure_url = `magnet:?xt=urn:btih:${item.infoHash}`;
			item.enclosure_type = "application/x-bittorrent";
			return item;
		})));
		return {
			title: feed.title,
			link: currentLink,
			description: feed.description,
			item: items
		};
	}
	feed.items.map((item) => {
		item.description = item.content;
		item.enclosure_url = `magnet:?xt=urn:btih:${item.infoHash}`;
		item.enclosure_type = "application/x-bittorrent";
		return item;
	});
	return {
		title: feed.title,
		link: currentLink,
		description: feed.description,
		item: feed.items
	};
}
//#endregion
export { route };
