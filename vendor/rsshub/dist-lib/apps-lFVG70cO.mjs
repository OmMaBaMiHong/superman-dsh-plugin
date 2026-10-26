import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/scoop/apps.tsx
const orderbys = (desc) => {
	const base = {
		0: "search.score() desc, Metadata/OfficialRepositoryNumber desc, NameSortable asc",
		1: "NameSortable asc, Metadata/OfficialRepositoryNumber desc, Metadata/RepositoryStars desc, Metadata/Committed desc",
		2: "Metadata/Committed desc, Metadata/OfficialRepositoryNumber desc, Metadata/RepositoryStars desc"
	};
	if (desc === "1") return base;
	const inverted = {};
	for (const key in base) inverted[key] = base[key].replaceAll(/\b(desc|asc)\b/gi, (match) => match.toLowerCase() === "desc" ? "asc" : "desc");
	return inverted;
};
const filters = {
	o: "Metadata/OfficialRepositoryNumber eq 1",
	dm: "Metadata/DuplicateOf eq null"
};
const handler = async (ctx) => {
	const { query = "s=2&d=1&n=true&dm=true&o=true" } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "50");
	const baseUrl = "https://scoop.sh";
	const apiBaseUrl = "https://scoopsearch.search.windows.net";
	const targetUrl = new URL(`/#/apps?${query}`, baseUrl).href;
	const apiUrl = new URL("indexes/apps/docs/search", apiBaseUrl).href;
	const targetResponse = await rofetch(targetUrl);
	const language = load(targetResponse)("html").attr("lang") ?? "en";
	const scriptRegExp = /<script type="module" crossorigin src="(.*?)"><\/script>/;
	const scriptUrl = scriptRegExp.test(targetResponse) ? new URL(targetResponse.match(scriptRegExp)?.[1], baseUrl).href : "";
	if (!scriptUrl) throw new Error("JavaScript file not found.");
	const key = (await rofetch(scriptUrl, { parseResponse: (txt) => txt })).match(/VITE_APP_AZURESEARCH_KEY:"(.*?)"/)?.[1];
	if (!key) throw new Error("Key not found.");
	const isOffcial = !query.includes("o=false");
	const isDistinct = !query.includes("dm=false");
	const sort = query.match(/s=(\d+)/)?.[1] ?? "2";
	const desc = query.match(/d=(\d+)/)?.[1] ?? "1";
	const items = (await rofetch(apiUrl, {
		method: "post",
		query: { "api-version": "2020-06-30" },
		headers: {
			"api-key": key,
			origin: baseUrl,
			referer: baseUrl
		},
		body: {
			count: true,
			search: "",
			searchMode: "all",
			filter: [isOffcial ? filters.o : void 0, isDistinct ? filters.dm : void 0].filter(Boolean).join(" and "),
			orderby: orderbys(desc)[sort],
			skip: 0,
			top: limit,
			select: "Id,Name,NamePartial,NameSuffix,Description,Notes,Homepage,License,Version,Metadata/Repository,Metadata/FilePath,Metadata/OfficialRepository,Metadata/RepositoryStars,Metadata/Committed,Metadata/Sha",
			highlight: "Name,NamePartial,NameSuffix,Description,Version,License,Metadata/Repository",
			highlightPreTag: "<mark>",
			highlightPostTag: "</mark>"
		}
	})).value.slice(0, limit).map((item) => {
		const repositoryName = item.Metadata.Repository.split(/\//).slice(-2).join("/");
		const title = `${item.Name} ${item.Version} in ${repositoryName}`;
		const description = renderToString(/* @__PURE__ */ jsx(ScoopDescription, { item }));
		const pubDate = item.Metadata.Committed;
		const linkUrl = item.Homepage;
		const authors = [{
			name: repositoryName,
			url: item.Metadata.Repository,
			avatar: void 0
		}];
		const guid = `scoop-${item.Name}-${item.Version}-${item.Metadata.Sha}`;
		const updated = pubDate;
		return {
			title,
			description,
			pubDate: pubDate ? parseDate(pubDate) : void 0,
			link: linkUrl,
			author: authors,
			guid,
			id: guid,
			content: {
				html: description,
				text: description
			},
			updated: updated ? parseDate(updated) : void 0,
			language
		};
	});
	const author = "Scoop";
	return {
		title: `${author} - Apps`,
		description: void 0,
		link: targetUrl,
		item: items,
		allowEmpty: true,
		author,
		language,
		id: targetUrl
	};
};
const ScoopDescription = ({ item }) => {
	const repositoryName = item.Metadata.Repository.split(/\//).slice(-2).join("/");
	return /* @__PURE__ */ jsx("table", { children: /* @__PURE__ */ jsxs("tbody", { children: [
		item.Name ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "Name" }), /* @__PURE__ */ jsx("td", { children: item.Name })] }) : null,
		item.Repository ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "Repository" }), /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("a", {
			href: item.Metadata.Repository,
			children: repositoryName
		}) })] }) : null,
		item.Committed ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "Committed" }), /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("a", {
			href: `${item.Metadata.Repository}/commit/${item.Metadata.Sha}`,
			children: item.Metadata.Committed
		}) })] }) : null,
		item.Version ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "Version" }), /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsxs("a", {
			href: `${item.Metadata.Repository}/blob/${item.Metadata.FilePath}`,
			children: ["v", item.Version]
		}) })] }) : null,
		item.Description ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "Description" }), /* @__PURE__ */ jsx("td", { children: item.Description })] }) : null,
		item.Homepage ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "Homepage" }), /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("a", {
			href: item.Homepage,
			children: item.Homepage
		}) })] }) : null,
		item.License ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "License" }), /* @__PURE__ */ jsx("td", { children: item.License })] }) : null,
		item.Note ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "Note" }), /* @__PURE__ */ jsx("td", { children: item.Note })] }) : null
	] }) });
};
const route = {
	path: "/apps/:query?",
	name: "Apps",
	url: "scoop.sh",
	maintainers: ["nczitzk"],
	handler,
	example: "/scoop/apps",
	parameters: { query: { description: "Query, `s=2&d=1&n=true&dm=true&o=true` by default" } },
	description: `::: tip
To subscribe to [Apps](https://scoop.sh/#/apps?s=2\\&d=1\\&n=true\\&dm=true\\&o=true), where the source URL is \`https://scoop.sh/#/apps?s=2&d=1&n=true&dm=true&o=true\`, extract the certain parts from this URL to be used as parameters, resulting in the route as [\`/scoop/apps/s=2&d=1&n=true&dm=true&o=true\`](https://rsshub.app/scoop/apps/s=2\\&d=1\\&n=true\\&dm=true\\&o=true).
:::`,
	categories: ["program-update"],
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
		source: ["scoop.sh/#/apps", "scoop.sh"],
		target: (_, url) => {
			const query = new URL(url).searchParams.toString() ?? void 0;
			return `/scoop/apps${query ? `/${query}` : ""}`;
		}
	}],
	view: 5
};
//#endregion
export { handler, route };
