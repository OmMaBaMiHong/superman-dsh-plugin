import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
//#region lib/routes/obsidian/utils.ts
const hitsPerPage = 54;
const searchPageBaseUrl = "https://community.obsidian.md/search";
const titleRegex = /([^/]+)\.md$/;
async function buildCommunityFeed(type) {
	const pageUrl = getSearchPageUrl(type);
	const searchConfig = await getSearchConfig(pageUrl);
	const data = await rofetch(`${searchConfig.url}/collections/entries/documents/search`, {
		headers: { "X-TYPESENSE-API-KEY": searchConfig.apiKey },
		query: {
			filter_by: `type:=${type}`,
			per_page: hitsPerPage,
			q: "*",
			query_by: "name,authors,short_desc",
			sort_by: "github_created_at:desc"
		}
	});
	return {
		title: `Obsidian ${type === "plugin" ? "Plugins" : "Themes"}`,
		link: pageUrl,
		item: data.hits?.map(({ document }) => buildItem(document)) ?? []
	};
}
function getTitle(path) {
	const match = path.match(titleRegex);
	return match ? match[1] : "";
}
function getSearchPageUrl(type) {
	const url = new URL(searchPageBaseUrl);
	url.searchParams.set("type", type);
	url.searchParams.set("sort", "created");
	return url.href;
}
async function getSearchConfig(pageUrl) {
	const html = await rofetch(pageUrl);
	const match = html.match(/apiKey\\":\\"([^"\\]+)\\"[\s\S]*?url\\":\\"([^"\\]+)\\"/) ?? html.match(/"apiKey":"([^"]+)"[\s\S]*?"url":"([^"]+)"/);
	if (!match) throw new Error("Unable to locate Obsidian community search API config");
	return {
		apiKey: match[1],
		url: match[2].replaceAll(String.raw`\/`, "/")
	};
}
function buildItem(document) {
	return {
		title: document.name,
		description: document.short_desc,
		link: `https://community.obsidian.md/${document.type}s/${document.slug}`,
		guid: `${document.type}:${document.id}`,
		pubDate: document.github_created_at ? parseDate(document.github_created_at) : void 0,
		updated: document.latest_release_at ? parseDate(document.latest_release_at) : document.github_updated_at ? parseDate(document.github_updated_at) : void 0,
		author: document.authors?.join(", "),
		category: document.tags
	};
}
//#endregion
export { getTitle as n, buildCommunityFeed as t };
