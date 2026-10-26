import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/indiansinkuwait/latest.ts
const baseUrl = "https://www.indiansinkuwait.com";
const route = {
	path: "/latest",
	categories: ["new-media"],
	example: "/indiansinkuwait/latest",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["indiansinkuwait.com/latest-news", "indiansinkuwait.com/"] }],
	name: "News",
	maintainers: ["TonyRL"],
	handler,
	url: "indiansinkuwait.com/latest-news"
};
async function handler() {
	const { data: response } = await got_default(`${baseUrl}/latest-news`);
	const $ = load(response);
	const list = $(".paragraphs .span4").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find(".content-heading h6 a").text().trim(),
			link: baseUrl + item.find("a").attr("href")
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: response } = await got_default(item.link);
		const $ = load(response);
		item.pubDate = parseDate($("#ctl00_ContentPlaceHolder1_SpanAuthor").text());
		$("#newsdetails h3, #ctl00_ContentPlaceHolder1_SpanAuthor, .noprint, [id^=div-gpt-ad]").remove();
		item.description = $("#newsdetails").html();
		return item;
	})));
	return {
		title: $("head title").text(),
		description: $("head meta[name=\"description\"]").attr("content"),
		image: "https://www.indiansinkuwait.com/apple-touch-icon-152x152-precomposed.png",
		link: `${baseUrl}/latest-news`,
		item: items
	};
}
//#endregion
export { route };
