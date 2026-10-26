import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/aschmelyun/blog.ts
const route = {
	name: "Blog",
	categories: ["blog"],
	maintainers: ["raxod502"],
	path: "/blog",
	example: "/aschmelyun/blog",
	handler,
	radar: [{
		source: ["aschmelyun.com"],
		target: "/blog"
	}]
};
async function handler() {
	const $ = load(await rofetch("https://aschmelyun.com/blog/"));
	return {
		title: "Andrew Schmelyun Blog",
		link: "https://aschmelyun.com/",
		item: $("div.rounded-lg").toArray().map((item) => {
			item = $(item);
			const a = item.find("a.text-xl").first();
			return {
				title: a.text(),
				link: new URL(a.attr("href"), "https://aschmelyun.com/blog/").href,
				pubDate: parseDate(item.find("span.text-sm").text()),
				category: item.find("a.rounded-full").toArray().map((cat) => $(cat).text().trim()),
				description: item.find("p").first().text()
			};
		})
	};
}
//#endregion
export { route };
