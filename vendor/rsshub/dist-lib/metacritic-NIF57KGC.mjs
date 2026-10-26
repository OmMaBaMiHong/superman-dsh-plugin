import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/metacritic/util.ts
const sorts = {
	metascore: {
		id: "metaScore",
		name: "Metascore"
	},
	userscore: {
		id: "userScore",
		name: "User Score"
	},
	popular: {
		id: "popularityCount",
		name: "Most Popular"
	},
	new: {
		id: "releaseDate",
		name: "Releases"
	}
};
const types = {
	game: {
		id: "games",
		name: "Games"
	},
	movie: {
		id: "movies",
		name: "Movies"
	},
	tv: {
		id: "tv",
		name: "TV Shows"
	},
	albums: {
		id: "albums",
		name: "Music"
	}
};
//#endregion
//#region lib/routes/metacritic/index.tsx
const renderDescription = (image, description, score) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	image ? /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", {
		src: image.src,
		alt: image.alt
	}) }) : null,
	description ? /* @__PURE__ */ jsx("p", { children: description }) : null,
	score ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("span", { children: "Metascore:" }), score] }) : null
] }));
const route = {
	path: "/:type?/:sort?/:filter?",
	name: "Unknown",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const { type = "game", sort = "new", filter } = ctx.req.param();
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 50;
	const rootUrl = "https://www.metacritic.com";
	const apiUrl = new URL("finder/metacritic/web", "https://backend.metacritic.com").href;
	const currentUrlObject = new URL(`/browse/${type}/all/all/all-time/${sort}/${filter ? `?${filter}` : ""}`, rootUrl);
	const currentUrlParams = currentUrlObject.searchParams;
	const currentUrl = currentUrlObject.href;
	const { data: currentResponse } = await got_default(currentUrl);
	const apiKey = currentResponse.match(/apiKey=(.*?)&/)[1];
	const searchParams = {
		sortBy: `-${sorts[sort].id}`,
		productType: types[type].id,
		limit,
		apiKey
	};
	const genres = currentUrlParams.getAll("genre").join(",").toLowerCase();
	const releaseTypes = currentUrlParams.getAll("releaseType").join(",");
	const releaseYearMin = currentUrlParams.get("releaseYearMin");
	const releaseYearMax = currentUrlParams.get("releaseYearMax");
	if (genres) searchParams.genres = genres;
	if (releaseTypes) searchParams.releaseType = releaseTypes;
	if (releaseYearMin) searchParams.releaseYearMin = releaseYearMin;
	if (releaseYearMax) searchParams.releaseYearMax = releaseYearMax;
	const platforms = currentUrlParams.getAll("platform");
	const networks = currentUrlParams.getAll("network");
	if (platforms.length || networks.length) {
		const labels = {};
		const labelPattern = String.raw`\{label:"([^"]+)",value:(\d+),href:a,meta:\{mcDisplayWeight`;
		const matches = currentResponse.match(new RegExp(labelPattern, "g"));
		for (const m of matches) {
			const matches = m.match(new RegExp(labelPattern));
			labels[matches[1].toLowerCase().split(/(\s\(|\\u002f(?!\s))/, 1)[0].replaceAll("-", "---").replaceAll(/\s\/\s/g, "-or-").replaceAll("+", "-plus").replaceAll(/\s/g, "-")] = matches[2];
		}
		if (platforms.length) searchParams.gamePlatformIds = platforms.map((p) => Object.hasOwn(labels, p) ? labels[p] : void 0).filter(Boolean).join(",");
		if (networks.length) searchParams.streamingNetworkIds = networks.map((p) => Object.hasOwn(labels, p) ? labels[p] : void 0).filter(Boolean).join(",");
	}
	const { data: response } = await got_default(apiUrl, { searchParams });
	const items = response.data.items.slice(0, limit).map((item) => ({
		title: item.title,
		link: new URL(`${type}/${item.slug}`, rootUrl).href,
		description: renderDescription(item.image ? {
			src: new URL(`a/img/catalog${item.image.bucketPath}`, rootUrl).href,
			alt: item.image.alt
		} : void 0, item.description, item.criticScoreSummary?.score ?? void 0),
		category: item.genres?.map((c) => c.name),
		guid: `metacritic-${item.id}`,
		pubDate: parseDate(item.releaseDate),
		upvotes: item.criticScoreSummary?.positiveCount ? Number(item.criticScoreSummary?.positiveCount) : 0,
		downvotes: item.criticScoreSummary?.negativeCount ? Number(item.criticScoreSummary?.negativeCount) : 0,
		comments: item.criticScoreSummary?.reviewCount ? Number(item.criticScoreSummary?.reviewCount) : 0
	}));
	const $ = load(currentResponse);
	const icon = new URL($("meta[data-hid=\"msapplication-task-metacritic\"]").prop("content").split("icon-uri=").pop(), rootUrl).href;
	return {
		item: items,
		title: $("title").text(),
		link: currentUrl,
		description: $("meta[name=\"description\"]").prop("content"),
		language: $("html").prop("lang"),
		image: $("link[rel=\"icon\"]").prop("content"),
		icon,
		logo: icon,
		subtitle: $("meta[name=\"msapplication-tooltip\"]").prop("content"),
		author: $("meta[name=\"twitter:site\"]").prop("content"),
		allowEmpty: true
	};
}
//#endregion
export { route };
