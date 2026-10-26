import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as processItems } from "./utils-DSe_8LiR.mjs";
//#region lib/routes/dw/news.ts
const route = {
	path: "/news/:lang?/:id?",
	categories: ["traditional-media"],
	example: "/dw/news",
	parameters: {
		lang: "Language, see below, default to en",
		id: "Category ID, see below, default to the id of the Top Stories Page of the language chosen"
	},
	features: {
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		requireConfig: false
	},
	name: "News",
	maintainers: ["quiniapiezoelectricity"],
	handler,
	description: `::: tip
Parameters can be obtained from the official website, for instance:
For the site <https://www.dw.com/de/deutschland/s-12321> the language code would be \`de\` and the category ID would be \`s-1432\`.
:::`,
	radar: [{
		source: ["www.dw.com/:lang/:name/:id"],
		target: "/news/:lang/:id"
	}]
};
const defaultUrl = "https://www.dw.com/graph-api/en/content/navigation/9097";
const typenames = /* @__PURE__ */ new Set([
	"Article",
	"Liveblog",
	"Video"
]);
async function handler(ctx) {
	const lang = ctx.req.param("lang") ?? "en";
	let id = ctx.req.param("id");
	if (/^s-\d+$/.test(id)) id = id.match(/^s-(\d+)$/i)[1];
	else if (id === void 0) id = (await cache_default.tryGet("dw:navigation", async () => {
		return (await got_default(defaultUrl)).data.data.content.topStoriesNavigations;
	}, config.cache.routeExpire, false)).map((item) => item.namedUrl.split("/")).find((item) => item[1] === lang)[3].match(/^s-(\d+)$/i)[1];
	const feed = (await got_default(`https://www.dw.com/graph-api/${lang}/content/navigation/${id}`)).data.data.content;
	cache_default.set("dw:navigation", feed.topStoriesNavigations, config.cache.routeExpire);
	const items = await processItems(feed.contentComposition.informationSpaces.flatMap((section) => Object.values(section).flatMap((component) => component[0]?.contents || [])).filter((item) => typenames.has(item.__typename) && item.id).map((item) => {
		item.link = new URL(item.namedUrl, "https://www.dw.com").href;
		item.pubDate = item.contentDate;
		item.description = item.teaser;
		item.language = lang;
		item.type = item.__typename.toLowerCase();
		return item;
	}));
	return {
		title: `DW | ${feed.title}`,
		link: feed.canonicalUrl,
		description: feed.metaDescription,
		language: feed.topStoriesNavigations.find((item) => item.namedUrl.startsWith(`/${lang}/`))?.localeLang ?? lang,
		item: items
	};
}
//#endregion
export { route };
