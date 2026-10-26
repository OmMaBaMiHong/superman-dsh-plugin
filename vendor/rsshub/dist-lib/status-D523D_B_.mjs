import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/pingwest/status.ts
const route = {
	path: "/status",
	categories: ["new-media"],
	example: "/pingwest/status",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["pingwest.com/status", "pingwest.com/"] }],
	name: "实时要闻",
	maintainers: ["sanmmm"],
	handler,
	url: "pingwest.com/status"
};
async function handler() {
	const baseUrl = "https://www.pingwest.com";
	const items = load((await got_default(`${baseUrl}/api/state/list`, {
		searchParams: { page: 1 },
		headers: { Referer: baseUrl }
	})).data.data.list)("section.item").toArray().map((ele) => {
		const timestamp = ele.attribs["data-t"];
		const $item = load(ele);
		const rightNode = $item(".news-info");
		const tag = rightNode.find(".item-tag-list").text();
		const title = rightNode.find(".title").text();
		const link = rightNode.find("a").last().attr("href");
		let description = rightNode.text();
		const imgUrl = $item(".news-img img");
		if (imgUrl.length) {
			imgUrl.attr("src", imgUrl.attr("src").split("?x-", 1)[0]);
			description += `<br>${imgUrl.parent().html()}`;
		}
		return {
			title: title || tag,
			link: link.startsWith("http") ? link : `https:${link}`,
			description,
			pubDate: parseDate(timestamp, "X"),
			category: tag
		};
	});
	return {
		title: "品玩 - 实时要闻",
		description: "品玩 - 实时要闻",
		link: `${baseUrl}/status`,
		item: items
	};
}
//#endregion
export { route };
