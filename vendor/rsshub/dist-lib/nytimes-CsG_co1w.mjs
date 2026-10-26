import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as parser } from "./rss-parser-lNYr71DQ.mjs";
import { n as outPlaywright } from "./playwright-DGfbX7qN.mjs";
import { load } from "cheerio";
//#region lib/routes/nytimes/utils.ts
const ProcessImage = ($, e) => {
	let cover = `<figure><img src='${$(e).find("figure").find("picture").find("img").attr("src")}'><br><figcaption>`;
	const caption = $(e).find("figcaption");
	cover += `${$(caption[0]).text().trim()}</figcaption></figure>`;
	return cover;
};
const PuppeterGetter = async (ctx, context, link) => {
	return await cache_default.tryGet(`nyt: ${link}`, async () => {
		const page = await context.newPage();
		await page.route("**/*", (route) => {
			route.request().resourceType() === "document" ? route.continue() : route.abort();
		});
		await page.goto(link, { waitUntil: "domcontentloaded" });
		return await page.evaluate(() => document.querySelector("body").innerHTML);
	});
};
const ProcessFeed = (data, hasEnVersion = false) => {
	const $ = load(data);
	let content;
	const result = {};
	if (hasEnVersion) {
		content = $("section[name=\"articleBody\"]");
		result.title = `「英」${$("h1").text().trim()}`;
		result.author = $("article#story span[itemprop=\"name\"]").text();
		$("article#story > header").find("div[data-testid=\"photoviewer-wrapper\"]").each((i, e) => {
			const cover = ProcessImage($, e);
			$(cover).insertBefore(content[0].firstChild);
		});
		content.find("div[data-testid=\"photoviewer-wrapper\"]").each((i, e) => {
			const cover = ProcessImage($, e);
			$(cover).insertBefore(e);
			$(e).remove();
		});
		content.find("#CNB").each((i, e) => {
			$(e).next().remove();
		});
		content.find("div[id]").each((i, e) => {
			$(e).remove();
		});
		content.find("aside").each((i, e) => {
			$(e).remove();
		});
	} else {
		content = $("section.article-body");
		content.find("div.big_ad, div.article-body-aside").each((i, e) => {
			$(e).remove();
		});
		content.find("div.article-paragraph").each((i, e) => {
			$(e).html(`<p>${$(e).html()}</p>`);
		});
		if ($("figure.article-span-photo").length > 0) $($("figure.article-span-photo")).insertBefore(content[0].firstChild);
		if ($("footer.author-info").length > 0) $($("footer.author-info")).insertAfter(content[0].lastChild);
	}
	const time = $("time").attr("datetime");
	if (time) result.pubDate = parseDate(time);
	result.description = content.html();
	return result;
};
var utils_default = {
	ProcessFeed,
	PuppeterGetter
};
//#endregion
//#region lib/routes/nytimes/index.ts
const route = {
	path: "/:lang?",
	categories: ["traditional-media"],
	view: 0,
	example: "/nytimes/dual",
	parameters: { lang: {
		description: "language, default to Chinese",
		options: [
			{
				value: "dual",
				label: "Chinese-English"
			},
			{
				value: "en",
				label: "English"
			},
			{
				value: "traditionalchinese",
				label: "Traditional Chinese"
			},
			{
				value: "dual-traditionalchinese",
				label: "Chinese-English (Traditional Chinese)"
			}
		]
	} },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["nytimes.com/"],
		target: ""
	}],
	name: "News",
	maintainers: ["HenryQW", "pseudoyu"],
	handler,
	url: "nytimes.com/",
	description: "By extracting the full text of articles, we provide a better reading experience (full text articles) over the official one."
};
async function handler(ctx) {
	let { lang = "" } = ctx.req.param();
	lang = lang.toLowerCase();
	let title = "纽约时报中文网";
	let rssUrl = "https://cn.nytimes.com/rss/";
	switch (lang) {
		case "dual":
			title += " - 中英对照版";
			break;
		case "en":
			title += " - 英文原版";
			break;
		case "traditionalchinese":
			title = "紐約時報中文網";
			rssUrl = new URL("zh-hant", rssUrl).href;
			break;
		case "dual-traditionalchinese":
			title = "紐約時報中文網 - 中英對照版";
			rssUrl = new URL("zh-hant", rssUrl).href;
			lang = "dual";
			break;
		default:
	}
	const context = await outPlaywright();
	const feed = await parser.parseURL(rssUrl);
	const items = await Promise.all(feed.items.splice(0, 10).map(async (item) => {
		let link = item.link;
		let response, hasEnVersion = false, dual = false;
		if (lang === "dual") {
			link = link.replace("/?utm_source=RSS", "") + "/dual";
			try {
				response = await cache_default.tryGet(`nyt: ${link}`, async () => {
					return (await got_default(link)).data;
				});
				dual = true;
			} catch {
				response = await cache_default.tryGet(`nyt: ${item.link}`, async () => {
					return (await got_default(item.link)).data;
				});
			}
		} else {
			response = await cache_default.tryGet(`nyt: ${item.link}`, async () => {
				return (await got_default(item.link)).data;
			});
			if (lang === "en") {
				const $ = load(response);
				if ($(".dual-btn").length > 0) {
					hasEnVersion = true;
					link = $(".dual-btn a").last().attr().href;
					response = await utils_default.PuppeterGetter(ctx, context, link);
				}
			}
		}
		const single = {
			title: item.title,
			pubDate: item.pubDate,
			link,
			author: item["dc:creator"]
		};
		const result = utils_default.ProcessFeed(response, hasEnVersion);
		single.description = result.description?.replaceAll(/&#x611F;(&#x8C22|&#x8B1D);.*?cn\.letters@nytimes\.com&#x3002;/g, "");
		if (hasEnVersion) {
			single.title = result.title;
			single.author = result.author;
		}
		if (dual) single.title = `「中英」${single.title}`;
		return single;
	}));
	await context.close();
	return {
		title,
		link: "https://cn.nytimes.com",
		description: title,
		item: items
	};
}
//#endregion
export { route };
