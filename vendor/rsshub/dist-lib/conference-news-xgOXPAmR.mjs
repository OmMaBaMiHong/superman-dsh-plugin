import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/tctmd/conference-news.ts
const route = {
	path: "/conference-news",
	categories: ["journal"],
	example: "/tctmd/conference-news",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.tctmd.com/news/conference-news"] }],
	name: "Conference News",
	maintainers: ["ChuYinan2023"],
	handler,
	url: "www.tctmd.com/news/conference-news"
};
async function handler() {
	const rootUrl = "https://www.tctmd.com";
	const $ = load((await got_default({
		method: "get",
		url: `${rootUrl}/search?keyword=&f%5B0%5D=news_subtype%3AConference%20News&f%5B1%5D=type%3Anews`
	})).data);
	const items = $(".views-row article.news-teaser").toArray().map((el) => {
		const $el = $(el);
		const $link = $el.find("h2.algolia-search--title a");
		const href = $link.attr("href");
		if (!href) return null;
		return {
			title: $link.text().trim(),
			link: href.startsWith("http") ? href : `${rootUrl}${href}`,
			pubDate: $el.find("time.datetime").attr("datetime") ? parseDate($el.find("time.datetime").attr("datetime")) : void 0,
			author: $el.find(".author__container--name").text().trim(),
			image: $el.find(".field--name-field-teaser-image img").attr("src")
		};
	}).filter(Boolean);
	const fullItems = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		const articleBody = content(".field--name-field-body-content").html() || "";
		const introText = content(".field--name-field-intro-text").text().trim();
		if (articleBody) item.description = (introText ? `<p><strong>${introText}</strong></p>` : "") + articleBody;
		else if (introText) item.description = introText;
		if (!item.pubDate) {
			const detailTime = content("time").first().attr("datetime");
			if (detailTime) item.pubDate = parseDate(detailTime);
		}
		if (!item.author) {
			const detailAuthor = content(".node-meta__text a").first().text().trim();
			if (detailAuthor) item.author = detailAuthor;
		}
		return item;
	})));
	return {
		title: "TCTMD - Conference News",
		description: "Latest conference news coverage from TCTMD, the leading source for interventional cardiology news",
		link: `${rootUrl}/news/conference-news`,
		image: "https://www.tctmd.com/themes/tctmd/logo.svg",
		item: fullItems
	};
}
//#endregion
export { route };
