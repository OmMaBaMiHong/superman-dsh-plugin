import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
//#region lib/routes/openalex/works.ts
const rootUrl = "https://api.openalex.org";
const reconstructAbstract = (invertedIndex) => {
	if (!invertedIndex) return "";
	const words = [];
	for (const [word, positions] of Object.entries(invertedIndex)) for (const pos of positions) words[pos] = word;
	return words.filter(Boolean).join(" ");
};
const filterTypeMap = {
	subfield: "primary_topic.subfield.id",
	topic: "primary_topic.id",
	field: "primary_topic.field.id",
	domain: "primary_topic.domain.id"
};
const handler = async (ctx) => {
	const { journals, type, ids } = ctx.req.param();
	const twoWeeksAgo = /* @__PURE__ */ new Date();
	twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
	const filters = [
		`publication_date:>${twoWeeksAgo.toISOString().split("T", 1)[0]}`,
		"has_abstract:true",
		`primary_location.source.id:${journals}`
	];
	if (type && ids) {
		if (!Object.hasOwn(filterTypeMap, type)) throw new Error(`Invalid type: ${type}. Must be one of: ${Object.keys(filterTypeMap).join(", ")}`);
		const typeField = filterTypeMap[type];
		filters.push(`${typeField}:${ids}`);
	}
	const filter = filters.join(",");
	const response = await rofetch(`${rootUrl}/works`, { query: {
		filter,
		sort: "publication_date:desc",
		"per-page": 100
	} });
	const seenTitleKeys = /* @__PURE__ */ new Set();
	const items = response.results.filter((work) => {
		if (!reconstructAbstract(work.abstract_inverted_index).trim()) return false;
		return work.authorships?.some((authorship) => authorship.institutions?.length > 0) ?? false;
	}).map((work) => {
		const abstract = reconstructAbstract(work.abstract_inverted_index);
		const authors = work.authorships?.map((a) => a.author.display_name).join(", ") || "";
		const doiUrl = work.doi ? `https://doi.org/${work.doi.replace("https://doi.org/", "")}` : work.id;
		const normalizedTitle = (work.title || "Untitled").trim().toLowerCase();
		const pubDate = work.publication_date ? new Date(work.publication_date) : void 0;
		return {
			title: work.title || "Untitled",
			link: doiUrl,
			description: abstract,
			author: authors,
			pubDate,
			guid: work.id,
			normalizedTitle,
			category: work.primary_topic?.subfield?.display_name ? [work.primary_topic.subfield.display_name] : []
		};
	}).filter((item) => {
		const day = item.pubDate instanceof Date ? item.pubDate.toISOString().split("T", 1)[0] : "";
		const titleKey = `${item.normalizedTitle}::${day}`;
		if (seenTitleKeys.has(titleKey)) return false;
		seenTitleKeys.add(titleKey);
		return true;
	}).map(({ normalizedTitle: _normalizedTitle, ...item }) => ({ ...item }));
	const journalIdArray = journals.split("|");
	let feedTitle = "OpenAlex Works";
	try {
		const journalPart = (await Promise.all(journalIdArray.map((id) => getJournalName(id)))).join(", ");
		if (type && ids) {
			const filterIdArray = ids.split("|");
			let filterPart;
			if (filterIdArray.length <= 3) filterPart = (await Promise.all(filterIdArray.map((id) => getFilterName(type, id)))).join(", ");
			else filterPart = "Compiled";
			feedTitle = `OpenAlex: ${journalPart} | ${filterPart}`;
		} else feedTitle = `OpenAlex: ${journalPart}`;
	} catch {}
	const description = type && ids ? `Recent publications from OpenAlex filtered by ${type} (last 2 weeks)` : "Recent publications from OpenAlex (last 2 weeks)";
	return {
		title: feedTitle,
		link: "https://openalex.org",
		description,
		item: items
	};
};
async function getJournalName(journalId) {
	return await cache_default.tryGet(`openalex:journal:${journalId}`, async () => {
		try {
			return (await rofetch(`${rootUrl}/sources/${journalId}`)).display_name || journalId;
		} catch {
			return journalId;
		}
	});
}
async function getFilterName(type, id) {
	return await cache_default.tryGet(`openalex:${type}:${id}`, async () => {
		try {
			return (await rofetch(`${rootUrl}/${type === "subfield" ? "subfields" : type === "topic" ? "topics" : type === "field" ? "fields" : "domains"}/${id}`)).display_name || id;
		} catch {
			return id;
		}
	});
}
const route = {
	path: "/:journals/:type?/:ids?",
	name: "Works",
	url: "openalex.org",
	maintainers: ["emdoe"],
	handler,
	example: "/openalex/s64187185/subfield/2604",
	parameters: {
		journals: "Pipe-separated journal source IDs (e.g., s64187185|s123456789)",
		type: "Optional filter type: subfield, topic, field, or domain",
		ids: "Optional pipe-separated filter IDs matching the type (e.g., 2604|2605 for subfields)"
	},
	description: `Get recent scientific publications from OpenAlex filtered by journal and optionally by topic classification (last 2 weeks).

Examples:

- /openalex/s64187185 - All works from a journal (no topic filter)
- /openalex/s64187185/subfield/2604 - Filter by subfield
- /openalex/s64187185|s123456/topic/T10001|T10002 - Filter by topic with multiple journals
- /openalex/s64187185/field/19 - Filter by field
- /openalex/s64187185/domain/1 - Filter by domain`,
	categories: ["journal"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportRadar: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["openalex.org/works"],
		target: "/:journals/:type?/:ids?"
	}]
};
//#endregion
export { handler, route };
