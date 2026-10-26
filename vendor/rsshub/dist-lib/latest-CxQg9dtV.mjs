import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as SUB_URL, r as loadArticle, t as SUB_NAME_PREFIX } from "./const-Cso4Lj9S.mjs";
import { load } from "cheerio";
//#region lib/routes/everia/latest.ts
const route = {
	path: "/",
	categories: ["picture"],
	example: "/everia",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	radar: [{
		source: ["everia.club/"],
		target: ""
	}],
	name: "Latest",
	maintainers: ["KTachibanaM", "AiraNadih"],
	handler
};
async function handler(ctx) {
	const limit = Number.parseInt(ctx.req.query("limit")) || 20;
	const $ = load((await got_default(SUB_URL)).body);
	const itemRaw = $("article.blog-entry").slice(0, limit).toArray();
	return {
		title: `${SUB_NAME_PREFIX} - Latest`,
		link: SUB_URL,
		item: await Promise.all(itemRaw.map((e) => {
			const link = $(e).find("h2.entry-title a").attr("href");
			return cache_default.tryGet(link, () => loadArticle(link));
		}))
	};
}
//#endregion
export { route };
