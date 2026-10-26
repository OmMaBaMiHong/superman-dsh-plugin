import { n as parseRelativeDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/guangdiu/rank.ts
const host = "https://guangdiu.com";
const route = {
	path: "/rank",
	categories: ["shopping"],
	example: "/guangdiu/rank",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["guangdiu.com/rank"] }],
	name: "一小时风云榜",
	maintainers: ["fatpandac"],
	handler,
	url: "guangdiu.com/rank"
};
async function handler() {
	const url = `${host}/rank.php`;
	const $ = load((await got_default(url)).data);
	const list = $("div.hourrankitem").toArray().map((item) => ({
		title: $(item).find("a.hourranktitle").text(),
		link: new URL($(item).find("a.hourranktitle").attr("href"), host).href
	}));
	return {
		title: "逛丢 - 一小时风云榜",
		link: url,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const $ = load((await got_default(item.link)).data);
			item.description = $("#dabstract").html() + $("a.dgotobutton").html("前往购买");
			item.pubDate = parseRelativeDate($("div.hourranktime").text());
			return item;
		})))
	};
}
//#endregion
export { route };
