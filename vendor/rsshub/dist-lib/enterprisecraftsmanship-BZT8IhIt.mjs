import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/enterprisecraftsmanship/index.ts
const route = {
	path: "/archives",
	categories: ["blog"],
	example: "/enterprisecraftsmanship/archives",
	radar: [{ source: ["enterprisecraftsmanship.com/archives/"] }],
	url: "enterprisecraftsmanship.com/",
	name: "Archives",
	maintainers: ["liyaozhong"],
	handler,
	description: "Enterprise Craftsmanship blog archives"
};
async function handler() {
	const currentUrl = `https://enterprisecraftsmanship.com/archives`;
	const $ = load((await got_default(currentUrl)).data);
	let items = $(".postIndexItem").toArray().map((item) => {
		const $item = $(item);
		return {
			title: $item.find(".title a").text().trim(),
			link: new URL($item.find(".title a").attr("href"), currentUrl).href,
			pubDate: parseDate($item.find(".date").text().trim())
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		try {
			const $detail = load((await got_default(item.link)).data);
			item.description = ($detail(".post > .paragraph").html() ?? "") + ($detail(".post >.sect1").html() ?? "");
			return item;
		} catch (error) {
			logger.error(`处理文章 ${item.link} 时发生错误: ${error}`);
			return item;
		}
	})));
	return {
		title: "Enterprise Craftsmanship - Archives",
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
