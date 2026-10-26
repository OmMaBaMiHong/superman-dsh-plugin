import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/literotica/new.ts
const route = {
	path: "/new",
	categories: ["reading"],
	example: "/literotica/new",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	radar: [{ source: ["literotica.com/"] }],
	name: "New Stories",
	maintainers: ["nczitzk"],
	handler,
	url: "literotica.com/"
};
async function handler() {
	const currentUrl = `https://www.literotica.com/stories/new_submissions.php`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	const list = $(".b-46t").toArray().map((item) => {
		item = $(item);
		const a = item.find(".p-48y");
		return {
			title: a.text(),
			link: a.attr("href"),
			category: item.nextAll().eq(3).text().replaceAll(/\(|\)/g, "").trim(),
			pubDate: parseDate(item.nextAll().eq(4).text().trim(), "MM/DD/YY"),
			author: item.nextAll().eq(2).text().replace(/Submitted by/, "").trim()
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = load((await got_default({
			method: "get",
			url: item.link
		})).data)(".aa_ht").html();
		return item;
	})));
	return {
		title: $("title").text(),
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
