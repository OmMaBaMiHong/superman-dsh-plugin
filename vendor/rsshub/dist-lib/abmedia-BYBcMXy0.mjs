import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/abmedia/index.ts
const rootUrl = "https://www.abmedia.io";
const postsAPIUrl = `${rootUrl}/wp-json/wp/v2/posts`;
const route = {
	path: "/index",
	categories: ["new-media"],
	example: "/abmedia/index",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.abmedia.io/"] }],
	name: "首页最新新闻",
	maintainers: [],
	handler,
	url: "www.abmedia.io/"
};
async function handler(ctx) {
	const limit = ctx.req.param("limit") ?? 10;
	const url = `${postsAPIUrl}?per_page=${limit}`;
	const items = (await got_default.get(url)).data.map((item) => ({
		title: item.title.rendered,
		link: item.link,
		description: item.content.rendered,
		pubDate: parseDate(item.date)
	}));
	return {
		title: "ABMedia - 最新消息",
		link: rootUrl,
		item: items
	};
}
//#endregion
export { route };
