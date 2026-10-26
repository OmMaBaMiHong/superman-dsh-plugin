import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { jsx } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/aeaweb/index.tsx
const route = {
	path: "/:id",
	categories: ["journal"],
	example: "/aeaweb/aer",
	parameters: { id: "Journal id, can be found in URL" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: true
	},
	radar: [{ source: ["aeaweb.org/journals/:id", "aeaweb.org/"] }],
	name: "Journal",
	maintainers: ["nczitzk"],
	handler,
	description: `The URL of the journal [American Economic Review](https://www.aeaweb.org/journals/aer) is \`https://www.aeaweb.org/journals/aer\`, where \`aer\` is the id of the journal, so the route for this journal is \`/aeaweb/aer\`.

::: tip
More jounals can be found in [AEA Journals](https://www.aeaweb.org/journals).
:::`
};
async function handler(ctx) {
	let id = ctx.req.param("id");
	const rootUrl = "https://www.aeaweb.org";
	const currentUrl = `${rootUrl}/journals/${id}`;
	let response = await got_default({
		method: "get",
		url: currentUrl
	});
	let $ = load(response.data);
	$(".read-more").remove();
	id = $("input[name=\"journal\"]").attr("value");
	const title = $(".page-title").text();
	const description = $(".intro-copy").text();
	response = await got_default({
		method: "get",
		url: `${rootUrl}/journals/search-results?journal=${id}&ArticleSearch[current]=1`
	});
	$ = load(response.data);
	let items = $("h4.title a").toArray().map((item) => {
		item = $(item);
		return { link: `${rootUrl}${item.attr("href").split("&", 1)[0]}` };
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		item.doi = content("meta[name=\"citation_doi\"]").attr("content");
		item.guid = item.doi;
		item.title = content("meta[name=\"citation_title\"]").attr("content");
		item.author = content(".author").toArray().map((a) => content(a).text().trim()).join(", ");
		item.pubDate = parseDate(content("meta[name=\"citation_publication_date\"]").attr("content"), "YYYY/MM");
		item.description = renderToString(/* @__PURE__ */ jsx(AeawebDescription, { description: content("meta[name=\"twitter:description\"]").attr("content").replace(/\(\w+ \d+\)( - )?/, "") }));
		return item;
	})));
	return {
		title,
		description,
		link: currentUrl,
		item: items,
		language: $("html").attr("lang")
	};
}
const AeawebDescription = ({ description }) => description ? /* @__PURE__ */ jsx("p", { children: description }) : null;
//#endregion
export { route };
