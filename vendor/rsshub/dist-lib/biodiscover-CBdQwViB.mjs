import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/biodiscover/index.ts
const route = {
	path: "/:channel?",
	radar: [{
		source: ["www.biodiscover.com/:channel"],
		target: "/:channel"
	}],
	name: "Unknown",
	maintainers: ["aidistan"],
	handler
};
async function handler(ctx) {
	const listUrl = "http://www.biodiscover.com/" + ctx.req.param("channel");
	const $ = load((await got_default({ url: listUrl })).data);
	const items = $(".new_list .newList_box").toArray().map((item) => ({
		pubDate: parseDate($(item).find(".news_flow_tag .times").text().trim()),
		link: "http://www.biodiscover.com" + $(item).find("h2 a").attr("href")
	}));
	return {
		title: "生物探索 - " + $(".header li.sel a").text(),
		link: listUrl,
		description: $("meta[name=description]").attr("content"),
		item: await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
			const $ = load((await got_default({ url: item.link })).data);
			const lastNode = $(".main_info").children().last();
			if (lastNode.css("display") === "none") lastNode.remove();
			return {
				title: $("h1").text().trim(),
				description: $(".main_info").html(),
				pubDate: item.pubDate,
				link: item.link
			};
		})))
	};
}
//#endregion
export { route };
