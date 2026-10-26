import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as parser } from "./rss-parser-lNYr71DQ.mjs";
import dayjs from "dayjs";
import { load } from "cheerio";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";
//#region lib/routes/phoronix/index.ts
dayjs.extend(utc);
dayjs.extend(timezone);
const redirectCacheKey = "phoronix:redirect";
const webArticlesCacheKey = "phoronix:web-articles";
const articleCacheKey = "phoronix:articles";
const baseUrl = "https://www.phoronix.com";
const rssUrl = `${baseUrl}/rss.php`;
const feedFetch = async () => {
	const feedStr = await rofetch(rssUrl);
	const feed = await parser.parseString(feedStr);
	return {
		title: feed.title,
		link: feed.link,
		description: feed.description,
		item: feed.items,
		language: feed.language,
		icon: "https://www.phoronix.com/android-chrome-192x192.png",
		image: "https://www.phoronix.com/android-chrome-192x192.png",
		logo: "https://www.phoronix.com/phxcms7-css/phoronix.png",
		category: [
			"Linux Hardware Reviews",
			"Linux hardware benchmarks",
			"Linux Hardware",
			"Linux benchmarking",
			"Desktop Linux",
			"GNU/Linux benchmarks",
			"Open Source AMD",
			"Linux How To",
			"X.Org drivers",
			"Ubuntu hardware",
			"Phoronix Test Suite"
		]
	};
};
const webFetchCb = (response) => {
	const $ = load(response.body);
	return {
		title: $("title").text(),
		link: response.url,
		description: $("meta[name=\"Description\"]").attr("content"),
		item: [...new Set($("#main a").toArray().map((e) => e.attribs.href))].filter((link) => link && (link.startsWith("/review/") || link.startsWith("/news/"))).map((link) => ({ link: `${baseUrl}${link}` })),
		language: "en-us",
		icon: "https://www.phoronix.com/android-chrome-192x192.png",
		image: "https://www.phoronix.com/android-chrome-192x192.png",
		logo: "https://www.phoronix.com/phxcms7-css/phoronix.png",
		category: $("meta[name=\"keywords\"]").attr("content").split(", ")
	};
};
const webFetch = (url) => cache_default.tryGet(`${webArticlesCacheKey}:${url}`, async () => {
	try {
		return webFetchCb(await got_default(url));
	} catch (error) {
		if ((error.name === "HTTPError" || error.name === "FetchError") && error.response.statusCode === 404) return "404";
		throw error;
	}
});
const legacyFetch = async (page, queryOrItem) => {
	const legacyUrl = new URL("/scan.php", baseUrl);
	legacyUrl.searchParams.set("page", page);
	if (queryOrItem) if (page === "category") legacyUrl.searchParams.set("item", queryOrItem);
	else legacyUrl.searchParams.set("q", queryOrItem);
	let response;
	const webUrl = await cache_default.tryGet(`${redirectCacheKey}:${legacyUrl.href}`, async () => {
		response = await got_default(legacyUrl.href);
		return response.url;
	});
	if (response) {
		const feed = webFetchCb(response);
		cache_default.set(`${webArticlesCacheKey}:${webUrl}`, feed);
		return feed;
	}
	return await webFetch(webUrl);
};
const tryFetch = async (category, topic) => {
	const webUrl = topic ? `${baseUrl}/${category}/${topic}` : `${baseUrl}/${category}`;
	let feed = await webFetch(webUrl);
	if (feed === "404") feed = await legacyFetch(category, topic);
	return feed;
};
const route = {
	path: "/:category?/:topic?",
	categories: ["new-media"],
	example: "/phoronix/linux/KDE",
	parameters: {
		category: "Category",
		topic: "Topic. You may find available parameters from their navigator links. E.g. to subscribe to `https://www.phoronix.com/reviews/Operating+Systems`, fill in the path `/phoronix/reviews/Operating+Systems`"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["phoronix.com/:category?/:topic?"] }],
	name: "News & Reviews",
	maintainers: ["oppliate", "Rongronggg9"],
	handler
};
async function handler(ctx) {
	const { category, topic } = ctx.req.param();
	let feed;
	switch (category) {
		case "category":
		case "news_topic":
			feed = await legacyFetch(category, topic);
			break;
		case "rss":
			feed = await feedFetch();
			break;
		default:
			feed = category ? await tryFetch(category, topic) : await feedFetch();
			break;
	}
	feed.item = await Promise.all(feed.item.map((item) => cache_default.tryGet(`${articleCacheKey}:${item.link}`, async () => {
		const html = (await got_default(item.link)).body;
		const $ = load(html);
		const content = $(".content");
		const authorSelector = $(".author > a");
		const author = authorSelector.slice(0, -2).toArray().map((e) => $(e).text());
		const category = [];
		if (item.link.includes("/news/")) category.push("News");
		else if (item.link.includes("/review/")) category.push("Review");
		const categorySelector = authorSelector.eq(-2);
		if (categorySelector.length) category.push(categorySelector.text());
		let pubDate;
		if (!item.pubDate) {
			let pubDateReadable = categorySelector.length && categorySelector[0].nextSibling?.nodeValue;
			if (pubDateReadable) {
				pubDateReadable = pubDateReadable.replaceAll(/on|at|\./g, "").trim();
				pubDate = /\d{4}$/.test(pubDateReadable) ? dayjs.utc(`${pubDateReadable} 08:00 UTC`).tz("America/Indiana/Indianapolis", true) : dayjs(pubDateReadable);
				if (!pubDate.isValid()) pubDate = pubDateReadable;
			}
		}
		const links = $(".pagination > a").toArray().map((pager) => `${baseUrl}${pager.attribs.href}`).slice(0, -1);
		if (links.length) {
			const pages = await Promise.all(links.map((link) => cache_default.tryGet(link, async () => {
				const html = (await got_default(link)).data;
				return load(html)(".content").html();
			})));
			content.append(pages);
		}
		const images = content.find("img");
		const topicImage = images.first();
		if (topicImage.attr("src")?.startsWith("/assets/categories/")) {
			const topicImageContainer = topicImage.parent();
			if (topicImageContainer.text().trim()) topicImage.remove();
			else topicImageContainer.remove();
		}
		images.each((_, img) => {
			img.attribs.src = img.attribs.src.replace(/_med$/, "");
		});
		return {
			title: item.title || $("article h1").text(),
			pubDate: item.pubDate || pubDate,
			author: author.join(", "),
			link: item.link,
			summary: $("meta[name=\"twitter:description\"]").attr("content"),
			description: content.html(),
			image: $("meta[name=\"twitter:image\"]").attr("content"),
			category: item.category || category
		};
	})));
	return feed;
}
//#endregion
export { route };
