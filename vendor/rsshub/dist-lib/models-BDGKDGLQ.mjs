import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { n as parseRelativeDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/ollama/models.ts
const route = {
	path: "/library",
	categories: ["programming"],
	example: "/ollama/library",
	radar: [{ source: ["ollama.com/library"] }],
	name: "Models",
	maintainers: ["Nick22nd", "gavrilov"],
	handler
};
async function handler() {
	const $ = load(await rofetch("https://ollama.com/library?sort=newest"));
	return {
		title: "ollama library",
		link: "https://ollama.com/library",
		item: $("#repo > ul > li > a").toArray().map((item) => {
			const name = $(item).find("h2 span").first();
			const link = $(item).attr("href");
			const description = $(item).find("div p.break-words").first();
			const pubDate = $(item).find("span:contains(\"Updated\")").first();
			return {
				title: name.text(),
				link,
				description: description.text(),
				pubDate: parseRelativeDate(pubDate.text())
			};
		})
	};
}
//#endregion
export { route };
