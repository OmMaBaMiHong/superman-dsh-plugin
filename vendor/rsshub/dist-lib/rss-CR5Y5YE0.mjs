import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/ygkkk/rss.ts
const route = {
	path: "/",
	categories: ["blog"],
	example: "/ygkkk",
	radar: [{ source: ["ygkkk.blogspot.com/"] }],
	name: "最新发表",
	maintainers: ["cnkmmk"],
	handler,
	url: "ygkkk.blogspot.com/"
};
async function handler() {
	const currentUrl = "https://ygkkk.blogspot.com";
	const $ = load((await got_default(`${currentUrl}/feeds/posts/default?alt=rss`)).data, { xmlMode: true });
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
