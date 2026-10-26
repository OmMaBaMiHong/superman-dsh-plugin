import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/howtoforge/rss.ts
const route = {
	path: "/",
	categories: ["study"],
	example: "/howtoforge",
	radar: [{ source: ["howtoforge.com/"] }],
	name: "Tutorials",
	maintainers: ["cnkmmk"],
	handler,
	url: "howtoforge.com/"
};
async function handler() {
	const currentUrl = "https://www.howtoforge.com";
	const $ = load((await got_default(`${currentUrl}/feed.rss`)).data, { xmlMode: true });
	return {
		title: $("channel > title").text(),
		description: $("channel > description").text(),
		link: currentUrl,
		item: $("channel > item").toArray().map((item) => {
			const $item = $(item);
			const link = $item.find("link").text();
			const title = $item.find("title").text();
			const description = $item.find("description").text();
			return {
				link,
				pubDate: $item.find("pubDate").text(),
				title,
				description
			};
		})
	};
}
//#endregion
export { route };
