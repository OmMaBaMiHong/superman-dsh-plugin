import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/withgoogle/explorables.ts
const route = {
	name: "PAIR - AI Exploreables",
	url: "pair.withgoogle.com/explorables",
	path: "/explorables",
	maintainers: ["cesaryuan"],
	example: "/withgoogle/explorables",
	categories: ["blog"],
	radar: [{
		source: ["pair.withgoogle.com/explorables"],
		target: ""
	}],
	handler: async () => {
		const baseUrl = "https://pair.withgoogle.com";
		const $ = load(await rofetch("https://pair.withgoogle.com/explorables", { method: "GET" }));
		return {
			title: "PAIR - AI Exploreables",
			link: "https://pair.withgoogle.com/explorables",
			item: await Promise.all($("div.explorable-card").toArray().map(async (el) => {
				const title = $(el).find("h3").text();
				const image = $(el).find("img").attr("src");
				const link = baseUrl + $(el).find("a").attr("href");
				return await cache_default.tryGet(link, async () => {
					let description = load(await rofetch(link))("body").html();
					if (!description || description.trim() === "") description = $("p").text();
					return {
						title,
						link,
						description,
						image
					};
				});
			}))
		};
	}
};
//#endregion
export { route };
