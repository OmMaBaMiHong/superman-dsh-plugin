import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/bmkg/earthquake.ts
const route = {
	path: "/earthquake",
	categories: ["forecast"],
	example: "/bmkg/earthquake",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["bmkg.go.id/", "bmkg.go.id/gempabumi-terkini.html"] }],
	name: "Recent Earthquakes",
	maintainers: ["Shinanory"],
	handler,
	url: "bmkg.go.id/"
};
async function handler() {
	const url = "https://www.bmkg.go.id/gempabumi-terkini.html";
	const $ = load((await got_default(url)).data);
	const items = $("div .table-responsive tbody tr").toArray().map((item) => {
		item = $(item);
		const td = item.find("td");
		return {
			title: `${td[2].children[0].data}|${td[3].children[0].data}|${td[4].children[0].data}|${td[5].children[0].data}|${td[6].children[0].data}`,
			link: url,
			pubDate: timezone(parseDate(`${td[1].children[0].data} ${td[1].children[2].data.slice(0, 8)}`, "DD-MM-YY HH:mm:ss"), 7)
		};
	});
	return {
		title: $("title").text(),
		link: url,
		description: "印尼气象气候和地球物理局 最近的地震(M ≥ 5.0) | BMKG earthquake",
		item: items,
		language: "in"
	};
}
//#endregion
export { route };
