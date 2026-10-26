import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/u9a9/index.ts
const baseUrl = "https://u9a9.com";
const route = {
	path: ["/:preview?", "/search/:keyword/:preview?"],
	example: "/u9a9/search/新片速递",
	radar: [{
		source: ["u9a9.com/"],
		target: ""
	}],
	name: "Search",
	maintainers: ["TonyRL"],
	handler,
	url: "u9a9.com/"
};
async function handler(ctx) {
	const { preview, keyword } = ctx.req.param();
	let link;
	let title;
	if (keyword) {
		link = `${baseUrl}/?type=2&search=${keyword}`;
		title = `${keyword} - U9A9`;
	} else {
		link = baseUrl;
		title = "U9A9";
	}
	const { data: response } = await got_default(link);
	const $ = load(response);
	const list = $("table tr").slice(1).toArray().map((item) => {
		item = $(item);
		const a = item.find("td").eq(1).find("a");
		const { size, unit } = item.find("td").eq(3).text().match(/(?<size>\d+\.\d+)\s(?<unit>\w+)/).groups;
		return {
			title: a.attr("title"),
			link: `${baseUrl}${a.attr("href")}`,
			pubDate: timezone(parseDate(item.find("td").eq(4).text()), 8),
			enclosure_url: item.find("td").eq(2).find("a").eq(1).attr("href"),
			enclosure_length: Number.parseInt(size * (unit === "GB" ? 1024 * 1024 * 1024 : 1024 * 1024)),
			enclosure_type: "application/x-bittorrent"
		};
	});
	const items = preview ? await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: response } = await got_default(item.link);
		item.description = load(response)(".panel-body").eq(1).html();
		return item;
	}))) : list;
	return {
		title,
		link,
		item: items
	};
}
//#endregion
export { route };
