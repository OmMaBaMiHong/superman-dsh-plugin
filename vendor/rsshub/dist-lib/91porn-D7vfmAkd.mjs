import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as renderIndexDescription, t as domainValidation } from "./utils-BoPP1z5P.mjs";
import { load } from "cheerio";
//#region lib/routes/91porn/index.ts
const route = {
	path: "/:lang?",
	categories: ["multimedia"],
	example: "/91porn",
	parameters: { lang: "Language, see below, `en_US` by default " },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	radar: [{
		source: ["91porn.com/index.php"],
		target: ""
	}],
	name: "Hot Video Today",
	maintainers: ["TonyRL"],
	handler,
	url: "91porn.com/index.php",
	description: `| English | 简体中文 | 繁體中文 |
| ------- | -------- | -------- |
| en\\_US  | cn\\_CN   | zh\\_ZH   |`
};
async function handler(ctx) {
	const { domain = "91porn.com" } = ctx.req.query();
	const siteUrl = `https://${domain}/index.php`;
	const { lang = "en_US" } = ctx.req.param();
	domainValidation(domain);
	const $ = load((await got_default.post(siteUrl, {
		form: { session_language: lang },
		headers: { referer: siteUrl }
	})).data);
	let items = $(".row .well").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find(".video-title").text(),
			link: item.find("a").attr("href"),
			poster: item.find(".img-responsive").attr("src")
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(`91porn:${lang}:${new URL(item.link).searchParams.get("viewkey")}`, async () => {
		const { data } = await got_default(item.link);
		const $ = load(data);
		item.pubDate = parseDate($(".title-yakov").eq(0).text(), "YYYY-MM-DD");
		item.description = renderIndexDescription({
			link: item.link,
			poster: item.poster
		});
		item.author = $(".title-yakov a span").text();
		delete item.poster;
		return item;
	})));
	return {
		title: `${$(".login_register_header").text()} - 91porn`,
		link: siteUrl,
		item: items
	};
}
//#endregion
export { route };
