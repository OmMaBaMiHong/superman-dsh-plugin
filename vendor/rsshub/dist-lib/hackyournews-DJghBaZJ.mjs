import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/hackyournews/index.ts
const route = {
	path: "/",
	radar: [{
		source: ["hackyournews.com/"],
		target: ""
	}],
	name: "Unknown",
	maintainers: ["ftiasch"],
	handler,
	url: "hackyournews.com/"
};
async function handler() {
	const baseUrl = "https://hackyournews.com";
	const { data: response } = await got_default(baseUrl);
	const $ = load(response);
	return {
		title: "Index",
		link: baseUrl,
		item: $("tr.story").toArray().map((story) => {
			const title = $(story).find("a").first().text();
			const nextRow = $(story).next();
			const metas = nextRow.text().trimStart().split("|");
			const upvotes = Number.parseInt(metas[0].split(" points", 1)[0].trim());
			const author = metas[0].split("by", 2)[1].trim();
			const pubDate = parseDate(metas[1].trim());
			let category = [];
			if (metas.length === 5) category = [metas[2].trim(), metas[3].trim()];
			const a = nextRow.find("a");
			const link = a.attr("href");
			const comments = Number.parseInt(a.text());
			const description = nextRow.find("p").toArray().map((p) => $(p).text()).join("<br>");
			return {
				title,
				link,
				author,
				category,
				comments,
				upvotes,
				pubDate,
				description
			};
		})
	};
}
//#endregion
export { route };
