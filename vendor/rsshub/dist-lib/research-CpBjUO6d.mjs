import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/netflix/research.ts
const route = {
	path: "/research",
	categories: ["new-media"],
	example: "/netflix/research",
	radar: [{ source: ["research.netflix.com/archive", "research.netflix.com"] }],
	name: "Research",
	maintainers: ["TonyRL"],
	handler,
	url: "research.netflix.com/"
};
const resolveArticle = (data, store) => {
	if (data === null) return data;
	if (typeof data !== "object") return data;
	if (Array.isArray(data)) return data.map((item) => resolveArticle(item, store));
	if (data.type === "id") {
		const target = store[data.id];
		return target === void 0 ? null : resolveArticle(target, store);
	}
	const out = Array.isArray(data) ? [] : {};
	for (const [k, v] of Object.entries(data)) out[k] = resolveArticle(v, store);
	return out;
};
async function handler() {
	const link = `https://research.netflix.com/archive`;
	const $ = load(await rofetch(link));
	const store = JSON.parse($("#__NEXT_DATA__").text()).props.pageProps.serverState.apollo.data;
	const list = Object.values(store.ROOT_QUERY).map((value) => resolveArticle(value, store)).flatMap((i) => i.items);
	const seen = /* @__PURE__ */ new Set();
	const items = list.filter((item) => {
		const title = item.title.trim();
		if (seen.has(title)) return false;
		seen.add(title);
		return true;
	}).map((item) => ({
		title: item.title,
		description: item.description,
		link: item.link,
		pubDate: item.date ?? item.startDate ? parseDate(item.date ?? item.startDate) : void 0,
		category: item.tags?.json,
		image: item.image?.url
	}));
	return {
		title: $("head title").text(),
		link,
		image: `${link}/favicon.ico`,
		item: items
	};
}
//#endregion
export { route };
