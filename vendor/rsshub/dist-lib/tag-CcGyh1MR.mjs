import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as SUB_URL, r as loadArticle, t as SUB_NAME_PREFIX } from "./const-BooavtNv.mjs";
//#region lib/routes/4kup/tag.ts
const route = {
	path: "/tag/:tag",
	categories: ["picture"],
	example: "/4kup/tag/asian",
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
		source: ["4kup.net/tag/:tag"],
		target: "/tag/:tag"
	}],
	name: "Tag",
	maintainers: ["AiraNadih"],
	handler,
	url: "4kup.net/"
};
async function handler(ctx) {
	const limit = Number.parseInt(ctx.req.query("limit")) || 20;
	const tag = ctx.req.param("tag");
	const tagUrl = `${SUB_URL}tag/${tag}/`;
	const { data } = await got_default(`${SUB_URL}wp-json/wp/v2/tags?slug=${tag}`);
	const tagId = data[0].id;
	const { data: posts } = await got_default(`${SUB_URL}wp-json/wp/v2/posts?tags=${tagId}&per_page=${limit}`);
	return {
		title: `${SUB_NAME_PREFIX} - Tag: ${tag}`,
		link: tagUrl,
		item: posts.map((post) => loadArticle(post))
	};
}
//#endregion
export { route };
