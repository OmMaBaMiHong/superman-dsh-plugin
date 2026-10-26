import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/lala/rss.ts
const route = {
	path: "/",
	categories: ["blog"],
	example: "/lala",
	radar: [{ source: ["lala.im/"] }],
	name: "最新发布",
	maintainers: ["cnkmmk"],
	handler,
	url: "lala.im/"
};
async function handler() {
	const currentUrl = "https://lala.im";
	const $ = load((await got_default(`${currentUrl}/feed`)).data, { xmlMode: true });
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
