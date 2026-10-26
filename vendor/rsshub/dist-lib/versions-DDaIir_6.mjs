import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/quicker/versions.ts
const route = {
	path: ["/update", "/versions"],
	name: "Unknown",
	maintainers: ["Cesaryuan", "nczitzk"],
	handler,
	url: "getquicker.net/Help/Versions"
};
async function handler() {
	const rootUrl = "https://getquicker.net";
	const currentUrl = `${rootUrl}/Help/Versions`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	const items = $(".version").toArray().map((item) => {
		item = $(item);
		const a = item.find("h2 a");
		return {
			title: a.text().trim(),
			link: `${rootUrl}${a.attr("href")}`,
			description: item.find(".article-content").html(),
			pubDate: parseDate(item.find(".text-secondary").first().text())
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
