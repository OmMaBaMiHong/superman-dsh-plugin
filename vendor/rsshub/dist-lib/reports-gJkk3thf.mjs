import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/cncf/reports.ts
const rootURL = "https://www.cncf.io";
const route = {
	path: "/reports",
	radar: [{ source: ["cncf.io/reports"] }],
	name: "Unknown",
	maintainers: [],
	handler,
	url: "cncf.io/reports"
};
async function handler() {
	const url = `${rootURL}/reports/`;
	const $ = load((await got_default(url)).data);
	const list = $("div.report-item").toArray().map((item) => ({
		title: $(item).find("a.report-item__link").attr("title"),
		link: $(item).find("a.report-item__link").attr("href")
	}));
	return {
		title: "CNCF - Reports",
		link: url,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const content = load((await got_default(item.link)).data);
			item.parseDate = parseDate(content("p.is-style-spaced-uppercase").text().split(":", 2)[1]);
			item.description = content("article > div.has-background").html();
			return item;
		})))
	};
}
//#endregion
export { route };
