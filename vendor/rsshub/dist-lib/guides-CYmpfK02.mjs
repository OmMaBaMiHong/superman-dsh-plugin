import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/dev.to/guides.ts
const route = {
	path: "/guides",
	categories: ["programming"],
	example: "/dev.to/guides",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["dev.to/"] }],
	name: "Trending Guides",
	maintainers: ["Rjnishant530"],
	handler,
	url: "dev.to"
};
async function handler() {
	const baseUrl = "https://dev.to";
	const $ = load((await got_default(baseUrl)).data);
	const guideLinks = $(".widget-link-list .crayons-link--contentful").toArray().map((element) => {
		const $element = $(element);
		return {
			title: $element.text().trim(),
			link: baseUrl + $element.attr("href")
		};
	});
	return {
		title: "DEV.to - Trending Guides",
		link: baseUrl,
		description: "Trending guides and resources from DEV.to",
		language: "en-us",
		item: await Promise.all(guideLinks.map((item) => cache_default.tryGet(item.link, async () => {
			const $article = load((await got_default(item.link)).data);
			const coverImage = $article(".crayons-article__cover img").attr("src");
			const content = $article(".crayons-article__body").html() || "";
			const authorName = $article(".crayons-article__header__meta .fw-bold").first().text().trim();
			const authorUrl = $article(".crayons-article__header__meta .fw-bold").first().attr("href");
			const authorAvatar = $article(".crayons-article__header__meta .radius-full").attr("src");
			const dateString = $article("time[datetime]").first().attr("datetime");
			const pubDate = dateString ? parseDate(dateString) : void 0;
			const tags = $article(".spec__tags .crayons-tag").toArray().map((tag) => $(tag).text().trim().replace("#", ""));
			return {
				title: item.title,
				link: item.link,
				description: content,
				image: coverImage,
				pubDate,
				category: tags,
				author: [{
					name: authorName,
					url: authorUrl ? baseUrl + authorUrl : void 0,
					avatar: authorAvatar
				}]
			};
		}))),
		icon: "https://media2.dev.to/dynamic/image/width=32,height=,fit=scale-down,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2F8j7kvp660rqzt99zui8e.png"
	};
}
//#endregion
export { route };
