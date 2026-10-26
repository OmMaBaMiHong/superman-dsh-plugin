import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as SUB_URL, r as loadArticle, t as SUB_NAME_PREFIX } from "./const-BooavtNv.mjs";
//#region lib/routes/4kup/latest.ts
const route = {
	path: "/",
	categories: ["picture"],
	example: "/4kup",
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
		source: ["4kup.net/"],
		target: ""
	}],
	name: "Latest",
	maintainers: ["AiraNadih"],
	handler,
	url: "4kup.net/"
};
async function handler(ctx) {
	const { data: posts } = await got_default(`${SUB_URL}wp-json/wp/v2/posts?per_page=${Number.parseInt(ctx.req.query("limit")) || 20}`);
	return {
		title: `${SUB_NAME_PREFIX} - Latest`,
		link: SUB_URL,
		item: posts.map((post) => loadArticle(post))
	};
}
//#endregion
export { route };
