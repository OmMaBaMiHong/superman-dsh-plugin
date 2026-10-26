import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
//#region lib/routes/inspirehep/utils.ts
const baseUrl = "https://inspirehep.net";
const parseLiterature = (hits) => hits.map((item) => ({
	title: item.metadata.titles.map((t) => t.title).join(" "),
	link: `${baseUrl}/literature/${item.id}`,
	description: item.metadata.abstracts?.map((a) => `<span>${a.value}</span>`).join("<br>"),
	pubDate: parseDate(item.created),
	updated: parseDate(item.updated),
	category: item.metadata.keywords?.map((k) => k.value),
	author: item.metadata.authors.map((a) => `${a.first_name} ${a.last_name}${a.affiliations ? ` (${a.affiliations.map((aff) => aff.value).join(", ")})` : ""}`).join(", ")
}));
//#endregion
export { parseLiterature as n, baseUrl as t };
