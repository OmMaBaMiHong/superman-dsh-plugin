import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as SUB_URL, r as loadArticle, t as SUB_NAME_PREFIX } from "./const-CyahSu9m.mjs";
//#region lib/routes/4khd/latest.ts
const route = {
	path: "/",
	categories: ["picture"],
	example: "/4khd",
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
		source: ["www.4khd.com/"],
		target: ""
	}],
	name: "Latest",
	maintainers: ["AiraNadih"],
	handler,
	url: "www.4khd.com/"
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
