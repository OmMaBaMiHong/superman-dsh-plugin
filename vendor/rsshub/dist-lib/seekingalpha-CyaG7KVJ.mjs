import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/seekingalpha/index.tsx
const baseUrl = "https://seekingalpha.com";
const route = {
	path: "/:symbol/:category?",
	categories: ["finance"],
	example: "/seekingalpha/TSM/transcripts",
	parameters: {
		symbol: "Stock symbol",
		category: "Category, see below, `news` by default"
	},
	features: { antiCrawler: true },
	radar: [{
		source: ["seekingalpha.com/symbol/:symbol/:category", "seekingalpha.com/symbol/:symbol/earnings/:category"],
		target: "/:symbol/:category"
	}],
	name: "Summary",
	maintainers: ["TonyRL"],
	handler,
	description: `| Analysis | News | Transcripts | Press Releases | Related Analysis |
| -------- | ---- | ----------- | -------------- | ---------------- |
| analysis | news | transcripts | press-releases | related-analysis |`
};
const getMachineCookie = () => cache_default.tryGet("seekingalpha:machine_cookie", async () => {
	return (await rofetch.raw(baseUrl)).headers.getSetCookie().map((c) => c.split(";", 1)[0]);
});
const apiParams = {
	article: {
		slug: "/articles",
		include: "author,primaryTickers,secondaryTickers,otherTags,presentations,presentations.slides,author.authorResearch,author.userBioTags,co_authors,promotedService,sentiments"
	},
	news: {
		slug: "/news",
		include: "author,primaryTickers,secondaryTickers,otherTags"
	},
	pr: {
		slug: "/press_releases",
		include: "acquireService,primaryTickers"
	}
};
async function handler(ctx) {
	const { category = "news", symbol } = ctx.req.param();
	const pageUrl = `${baseUrl}/symbol/${symbol.toUpperCase()}/${category === "transcripts" ? `earnings/${category}` : category}`;
	const machineCookie = await getMachineCookie();
	const response = await rofetch(`${baseUrl}/api/v3/symbols/${symbol.toUpperCase()}/${category}`, {
		headers: { cookie: machineCookie.join("; ") },
		query: {
			"filter[since]": 0,
			"filter[until]": 0,
			id: symbol.toLowerCase(),
			include: "author,primaryTickers,secondaryTickers,sentiments",
			"page[size]": ctx.req.query("limit") ? Number(ctx.req.query("limit")) : category === "news" ? 40 : 20,
			"page[number]": 1
		}
	});
	const list = response.data?.map((item) => ({
		title: item.attributes.title,
		link: new URL(item.links.self, baseUrl).href,
		pubDate: parseDate(item.attributes.publishOn),
		author: response.included.find((i) => i.id === item.relationships.author.data.id).attributes.nick,
		id: item.id,
		articleType: item.links.self.split("/", 2)[1]
	}));
	const items = list ? await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const response = await rofetch(`${baseUrl}/api/v3${apiParams[item.articleType].slug}/${item.id}`, {
			headers: { cookie: machineCookie.join("; ") },
			query: { include: apiParams[item.articleType].include }
		});
		item.category = response.included.filter((i) => i.type === "tag").map((i) => i.attributes.company ? `${i.attributes.company} (${i.attributes.name})` : i.attributes.name);
		const summary = response.data.attributes.summary;
		item.description = (summary?.length ? renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("h2", { children: "Summary" }), /* @__PURE__ */ jsx("ul", { children: summary.map((entry) => /* @__PURE__ */ jsx("li", { children: entry })) })] })) : "") + response.data.attributes.content;
		item.updated = parseDate(response.data.attributes.lastModified);
		return item;
	}))) : [];
	return {
		title: response.meta.page.title,
		description: response.meta.page.description,
		link: pageUrl,
		image: "https://seekingalpha.com/samw/static/images/favicon.svg",
		item: items,
		allowEmpty: true,
		language: "en-US"
	};
}
//#endregion
export { route };
