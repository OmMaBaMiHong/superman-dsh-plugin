import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/brave/latest.ts
const route = {
	path: "/latest",
	categories: ["program-update"],
	example: "/brave/latest",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["brave.com/latest", "brave.com/"] }],
	name: "Release Notes",
	maintainers: ["nczitzk"],
	handler,
	url: "brave.com/latest"
};
async function handler() {
	const currentUrl = `https://brave.com/latest`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	const items = $(".box h3").toArray().map((item) => {
		item = $(item);
		const title = item.text();
		const device = item.parent().find("h2").text();
		const matchVersion = title.match(/(v[\d.]+)/);
		const matchDate = title.match(/\((.*?)\)/);
		return {
			title: `[${device}] ${title}`,
			link: currentUrl,
			guid: `${currentUrl}#${device}-${matchVersion?.[1] ?? title}`,
			description: item.next().html(),
			pubDate: parseDate(matchDate?.[1].replace(/(st|nd|rd|th)?,/, ""), ["MMMM D YYYY", "MMM D YYYY"])
		};
	});
	return {
		title: $("title").text(),
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
