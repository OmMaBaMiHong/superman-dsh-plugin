import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { load } from "cheerio";
//#region lib/routes/podwise/collections.ts
const route = {
	path: "/explore",
	categories: ["multimedia"],
	view: 4,
	example: "/podwise/explore",
	radar: [{ source: ["podwise.ai", "podwise.ai/explore"] }],
	name: "Collections",
	maintainers: ["lyling"],
	handler: async () => {
		const link = "https://podwise.ai/explore";
		const $ = load(await rofetch(link));
		const content = $("#navigator").next();
		const collectinDescription = content.find("p").eq(1).text();
		const items = content.find(".group").toArray().map((item) => {
			item = $(item);
			const title = item.find("a").first().text();
			const link = item.find("a").first().attr("href");
			const description = item.find("p").first().text();
			return {
				title,
				link: `https://podwise.ai${link}`,
				description
			};
		});
		return {
			title: $("title").text(),
			description: collectinDescription,
			item: items,
			link
		};
	}
};
//#endregion
export { route };
