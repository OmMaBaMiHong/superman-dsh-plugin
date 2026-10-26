import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration.js";
import { load } from "cheerio";
//#region lib/routes/podwise/episodes.ts
dayjs.extend(duration);
const route = {
	path: "/explore/:type",
	categories: ["multimedia"],
	example: "/podwise/explore/latest",
	parameters: { type: "latest or all episodes." },
	radar: [{ source: ["podwise.ai/explore/:type"] }],
	name: "Episodes",
	maintainers: ["lyling"],
	handler: async (ctx) => {
		const link = `https://podwise.ai/explore/${ctx.req.param("type")}`;
		const $ = load(await rofetch(link));
		const content = $("#navigator").next();
		const title = content.find("h1").first().text();
		const description = content.find("p").eq(1).text();
		const list = content.find(".group").toArray().map((item) => {
			item = $(item);
			const link = item.find("a").first().attr("href");
			const description = item.find("p").first().text();
			const pubDate = item.find("a").next().children("span").text();
			return {
				link: `https://podwise.ai${link}`,
				description,
				pubDate: timezone(parseDate(pubDate, "DD MMM YYYY", "en"), 8)
			};
		});
		return {
			title,
			description,
			link,
			item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
				const $ = load(await rofetch(item.link));
				item.description = $("summary").first().html();
				const $duration = $("img[alt=\"Podcast cover\"]").eq(1).next().find("span").eq(2);
				const nextData = JSON.parse($("script:contains(\"podName\")").first().text().match(/self\.__next_f\.push\((.+)\)/)?.[1] ?? "");
				const podcastData = JSON.parse(nextData[1].slice(2))[1][3].children[3].episode;
				item.title = podcastData.title;
				item.author = podcastData.podName;
				item.itunes_item_image = podcastData.cover;
				item.itunes_duration = parseDuration($duration.text());
				item.enclosure_url = podcastData.link;
				item.enclosure_type = toEnclosureType(podcastData.linkType);
				return item;
			})))
		};
	}
};
function parseDuration(durationStr) {
	const matches = durationStr.match(/(\d+h)?(\d+m)?/);
	const hours = matches[1] ? Number.parseInt(matches[1]) : 0;
	const minutes = matches[2] ? Number.parseInt(matches[2]) : 0;
	return dayjs.duration({
		hours,
		minutes
	}).asSeconds();
}
function toEnclosureType(linkType) {
	switch (linkType) {
		case "mp3": return "audio/mpeg";
		case "m4a": return "audio/x-m4a";
		case "mp4": return "video/mp4";
		default: return linkType;
	}
}
//#endregion
export { route };
