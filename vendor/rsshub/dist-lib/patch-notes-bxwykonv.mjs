import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/leagueoflegends/patch-notes.ts
const route = {
	path: "/patch-notes",
	categories: ["game"],
	example: "/leagueoflegends/patch-notes",
	radar: [{ source: ["www.leagueoflegends.com/en-us/news/tags/patch-notes/", "www.leagueoflegends.com/en-us/news/game-updates/:postSlug"] }],
	name: "Patch Notes",
	maintainers: ["noahm"],
	async handler() {
		const url = "https://www.leagueoflegends.com/en-us/news/tags/patch-notes/";
		const data = (await got_default({
			method: "get",
			url
		})).data;
		const nextData = load(data)("script[id=\"__NEXT_DATA__\"]").text();
		if (!nextData) throw new Error("missing next data");
		return {
			title: "League of Legends Patch Notes",
			link: url,
			item: JSON.parse(nextData).props.pageProps.page.blades[2].items.map((item) => ({
				title: item.title,
				description: item.description.body,
				pubDate: parseDate(item.publishedAt),
				link: item.action.payload.url,
				guid: item.analytics.contentId,
				image: item.media.url,
				itunes_item_image: item.media.url
			}))
		};
	}
};
//#endregion
export { route };
