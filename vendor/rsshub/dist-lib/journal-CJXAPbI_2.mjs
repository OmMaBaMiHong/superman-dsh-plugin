import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/aiaa/journal.ts
const route = {
	name: "ASR Articles",
	maintainers: ["HappyZhu99"],
	categories: ["journal"],
	path: "/journal/:journalID",
	parameters: { journalID: "journal ID, can be found in the URL" },
	example: "/aiaa/journal/aiaaj",
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("journalID");
	const baseUrl = "https://arc.aiaa.org";
	const $ = load(await rofetch(`${baseUrl}/action/showFeed?type=etoc&feed=rss&jc=${id}`), { xml: { xmlMode: true } });
	const channelTitle = $("title").first().text().replace(": Table of Contents", "");
	const imageUrl = $("image url").text();
	const items = $("item").toArray().map((element) => {
		const $item = $(element);
		return {
			title: $item.find(String.raw`dc\:title`).text(),
			link: $item.find("link").text() || "",
			description: $item.find("description").text() || "",
			pubDate: parseDate($item.find(String.raw`dc\:date`).text() || ""),
			author: $item.find(String.raw`dc\:creator`).toArray().map((authorElement) => $(authorElement).text()).join(", ")
		};
	});
	return {
		title: `${channelTitle} | arc.aiaa.org`,
		description: "List of articles from both the latest and ahead of print issues.",
		image: imageUrl,
		link: `${baseUrl}/journal/${id}`,
		item: items
	};
}
//#endregion
export { route };
