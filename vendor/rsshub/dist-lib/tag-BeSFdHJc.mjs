import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as SUB_URL, r as loadArticle, t as SUB_NAME_PREFIX } from "./const-BxzXSacB.mjs";
import { load } from "cheerio";
//#region lib/routes/cosplaytele/tag.ts
const route = {
	path: "/tag/:tag",
	categories: ["picture"],
	example: "/cosplaytele/tag/aqua",
	parameters: { tag: "Tag" },
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
		source: ["cosplaytele.com/tag/:tag"],
		target: "/tag/:tag"
	}],
	name: "Tag",
	maintainers: ["AiraNadih"],
	handler,
	url: "cosplaytele.com/"
};
async function handler(ctx) {
	const limit = Number.parseInt(ctx.req.query("limit")) || 20;
	const tag = ctx.req.param("tag");
	const tagUrl = `${SUB_URL}tag/${tag}/`;
	const $ = load((await got_default(tagUrl)).body);
	const itemRaw = $("#content .post-item").slice(0, limit).toArray();
	return {
		title: `${SUB_NAME_PREFIX} - Tag: ${tag}`,
		link: tagUrl,
		item: await Promise.all(itemRaw.map((e) => {
			const link = $(e).find("h5.post-title a").attr("href");
			return cache_default.tryGet(link, () => loadArticle(link));
		}))
	};
}
//#endregion
export { route };
