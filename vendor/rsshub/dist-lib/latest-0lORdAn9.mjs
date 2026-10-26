import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as SUB_URL, r as loadArticle, t as SUB_NAME_PREFIX } from "./const-Cq59Vb-Z.mjs";
import { load } from "cheerio";
//#region lib/routes/baobua/latest.ts
const route = {
	path: "/",
	categories: ["picture"],
	example: "/baobua",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["baobua.com/"],
		target: ""
	}],
	name: "Latest",
	maintainers: ["AiraNadih"],
	handler,
	url: "baobua.com/"
};
async function handler() {
	const $ = load((await got_default(SUB_URL)).body);
	const itemRaw = $(".thcovering-video").toArray();
	return {
		title: `${SUB_NAME_PREFIX} - Latest`,
		link: SUB_URL,
		item: await Promise.all(itemRaw.map((e) => {
			let link = $(e).find("a").attr("href");
			if (!link) return null;
			if (link.startsWith("/")) link = new URL(link, SUB_URL).href;
			return cache_default.tryGet(link, () => loadArticle(link));
		}).filter(Boolean))
	};
}
//#endregion
export { route };
