import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { load } from "cheerio";
//#region lib/routes/cherrytimes/market.ts
const route = {
	path: "/market",
	categories: ["new-media"],
	example: "/cherrytimes/market",
	name: "Market",
	maintainers: ["canonnizq"],
	handler: async () => {
		const $ = load(await rofetch("https://cherrytimes.it/en/tag/markets?page=1"));
		return {
			title: "Cherry Times - Market",
			link: "https://cherrytimes.it/en/tag/markets",
			item: $("div.post-container").toArray().map((item) => {
				const element = $(item);
				const a = element.find("a").eq(1);
				return {
					title: a.text(),
					link: a.attr("href"),
					description: element.find("p.excerpt").text(),
					category: element.find("a").last().text()
				};
			})
		};
	}
};
//#endregion
export { route };
