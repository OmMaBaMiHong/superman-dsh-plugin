import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/ollama/blog.ts
const route = {
	path: "/blog",
	categories: ["programming"],
	example: "/ollama/blog",
	radar: [{ source: ["ollama.com/blog"] }],
	name: "Blog",
	maintainers: ["gavrilov"],
	handler
};
async function handler() {
	const baseUrl = "https://ollama.com";
	const $ = load(await rofetch(`${baseUrl}/blog`));
	return {
		title: "ollama blog",
		link: "https://ollama.com/blog",
		item: $("a.group.border-b.py-10").toArray().map((item) => ({
			title: $(item).children("h2").first().text(),
			link: baseUrl + $(item).attr("href"),
			pubDate: parseDate($(item).children("h3").first().text()),
			description: $(item).children("p").first().text()
		}))
	};
}
//#endregion
export { route };
