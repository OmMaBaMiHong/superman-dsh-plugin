import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/jpmorganchase/research.ts
const base = "https://www.jpmorganchase.com";
const frontPageUrl = `${base}/institute/all-topics`;
const indexUrl = `${base}/services/json/v1/dynamic-grid.service/parent=jpmorganchase/global/US/en/home/institute/all-topics&comp=root/content-parsys/dynamic_grid&page=p1.json`;
const route = {
	path: "/",
	example: "/jpmorganchase",
	categories: ["finance"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["jpmorganchase.com/institute/all-topics"],
		target: "/"
	}],
	name: "Research Topics",
	maintainers: ["dousha"],
	handler,
	url: "www.jpmorganchase.com/institute/all-topics"
};
async function fetchIndexEntires() {
	const response = await rofetch(indexUrl);
	if (!("meta" in response)) return [];
	const meta = response.meta;
	const maxItemCount = Number(meta["partition-size"]);
	return response.items.slice(0, maxItemCount);
}
function fetchDataItem(entry) {
	const url = `${base}${entry.link}`;
	return cache_default.tryGet(url, async () => {
		let authors = [];
		let description = "";
		let category = [];
		let articleDate = entry.date;
		const pageContent = await rofetch(url);
		if (pageContent.length > 0) {
			const $ = load(pageContent);
			category = [$(".eyebrow").text()];
			authors = $(".author-name").toArray().map((el) => $(el).text().trim());
			articleDate = $(".date").text().trim() || entry.date;
			description = $(".root").children("div").children("div:eq(1)").html() || "";
		}
		return {
			category,
			author: authors.join(", "),
			title: entry.title,
			description,
			link: url,
			pubDate: parseDate(articleDate)
		};
	});
}
async function handler() {
	const entires = await fetchIndexEntires();
	const items = await Promise.all(entires.map((it) => fetchDataItem(it)));
	return {
		title: "All Topics - JPMorganChase Institute",
		link: frontPageUrl,
		item: items
	};
}
//#endregion
export { route };
