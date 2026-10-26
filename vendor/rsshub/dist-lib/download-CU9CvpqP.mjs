import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/wdc/download.ts
const route = {
	path: "/download/:id?",
	categories: ["program-update"],
	example: "/wdc/download/279",
	parameters: { id: "Software id, can be found in URL, 279 as Western Digital Dashboard by default" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Download",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const currentUrl = `https://support.wdc.com/downloads.aspx?p=${ctx.req.param("id") ?? "279"}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	const version = $("#WD_lblVersionSelected").text();
	const items = [{
		title: version,
		link: `${currentUrl}#${version}`,
		enclosure_url: $("#WD_hlDownloadFWSelected").attr("href"),
		pubDate: parseDate($("#WD_lblReleaseDateSelected").text(), "D/M/YYYY"),
		description: $(".toggleInner").html().replace(/style="color:White;"/, "")
	}];
	return {
		title: `${$("#WD_lblSelectedName").text()} | WD Support`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
