import { n as parseRelativeDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/rule34video/latest.ts
const route = {
	path: "/latest",
	categories: ["multimedia"],
	example: "/rule34video/latest",
	description: "Latest updates from Rule34 Video",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	radar: [{
		source: ["rule34video.com/latest-updates/"],
		target: "/latest"
	}],
	name: "Latest Updates",
	maintainers: ["ashi-koki"],
	handler
};
async function handler() {
	const $ = load((await got_default({
		method: "get",
		url: "https://www.rule34video.com/latest-updates/",
		headers: { Referer: "https://www.rule34video.com" }
	})).data);
	return {
		allowEmpty: true,
		title: "Rule34 Video Latest Updates",
		link: "https://www.rule34video.com/latest-updates/",
		description: "Latest updates from Rule34 Video",
		item: $("a.th.js-open-popup").toArray().map((element) => {
			const $el = $(element);
			const title = $el.attr("title")?.trim() || $el.find(".thumb_title").text().trim();
			const link = $el.attr("href")?.trim() || "";
			return {
				title,
				link,
				preview: $el.find("img.thumb.lazy-load").attr("data-original"),
				duration: $el.find(".time").text().trim(),
				added: $el.find(".added").text().replaceAll(/\s+/g, " ").trim(),
				rating: $el.find(".rating").text().trim(),
				views: $el.find(".views").text().trim(),
				hasSound: $el.find(".sound").length > 0,
				isHD: $el.find(".quality").length > 0,
				videoId: link.match(/\/video\/(\d+)\//)?.[1]
			};
		}).filter((item) => item.title && item.link).map((item) => buildDataItem(item))
	};
}
function buildDataItem(item) {
	let description = "";
	if (item.duration) description += `<p>Duration: ${item.duration}</p>`;
	if (item.views) description += `<p>Views: ${item.views}</p>`;
	if (item.rating) description += `<p>Rating: ${item.rating}</p>`;
	const qualities = [];
	if (item.isHD) qualities.push("HD");
	if (item.hasSound) qualities.push("Has Sound");
	if (qualities.length > 0) description += `<p>Quality: ${qualities.join(", ")}</p>`;
	if (item.preview) description += `<img src="${item.preview}" alt="${item.title}" />`;
	const pubDate = item.added ? parseRelativeDate(item.added) : void 0;
	return {
		title: item.title,
		link: item.link,
		description,
		image: item.preview,
		...pubDate && { pubDate: pubDate.toISOString() },
		guid: item.videoId ? `rule34video:${item.videoId}` : item.link,
		category: item.isHD ? ["HD"] : []
	};
}
//#endregion
export { route };
