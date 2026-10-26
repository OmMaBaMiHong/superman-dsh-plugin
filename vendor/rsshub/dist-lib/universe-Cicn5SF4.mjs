import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/typst/universe.ts
function deserializeAstroProps(val) {
	if (Array.isArray(val)) {
		const tag = val[0];
		if (tag === 0) return val.length > 1 ? deserializeAstroProps(val[1]) : void 0;
		if (tag === 1) return val[1].map((item) => deserializeAstroProps(item));
		return val.map((item) => deserializeAstroProps(item));
	}
	if (val && typeof val === "object") {
		const result = {};
		for (const [key, v] of Object.entries(val)) result[key] = deserializeAstroProps(v);
		return result;
	}
	return val;
}
const route = {
	path: "/universe",
	categories: ["program-update"],
	example: "/typst/universe",
	radar: [{
		source: ["typst.app/universe"],
		target: "/universe"
	}],
	name: "Universe",
	maintainers: ["HPDell"],
	handler: async () => {
		const targetUrl = "https://typst.app/universe/search";
		const props = load(await rofetch(targetUrl))("astro-island[component-export=\"SearchResults\"]").attr("props");
		return {
			title: "Typst Universe",
			link: targetUrl,
			item: deserializeAstroProps(JSON.parse(props)).packages.map((item) => ({
				title: `${item.name} (${item.version}) | ${item.description}`,
				link: `https://typst.app/universe/package/${item.name}`,
				description: item.description,
				pubDate: parseDate(item.updatedAt, "X"),
				category: item.keywords,
				author: item.authors.join(", ")
			}))
		};
	}
};
//#endregion
export { route };
