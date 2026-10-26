import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/hicairo/rss.ts
const route = {
	path: "/",
	categories: ["blog"],
	example: "/hicairo",
	radar: [{ source: ["hicairo.com/"] }],
	name: "最近发表",
	maintainers: ["cnkmmk"],
	handler,
	url: "hicairo.com/"
};
async function handler() {
	const currentUrl = "https://www.hicairo.com";
	const $ = load((await got_default(`${currentUrl}/feed.php`)).data, { xmlMode: true });
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
