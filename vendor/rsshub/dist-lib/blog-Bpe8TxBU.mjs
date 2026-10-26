import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/bitmovin/blog.ts
const baseUrl = "https://bitmovin.com";
const route = {
	path: "/blog",
	categories: ["programming"],
	example: "/bitmovin/blog",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["bitmovin.com/blog", "bitmovin.com/"] }],
	name: "Blog",
	maintainers: ["elxy"],
	handler,
	url: "bitmovin.com/blog"
};
async function handler(ctx) {
	const { data } = await got_default(`${`${baseUrl}/wp-json/wp/v2`}/posts`, { searchParams: { per_page: ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 100 } });
	const items = data.map((item) => ({
		title: item.title.rendered,
		author: item.authors.map((a) => a.display_name).join(", "),
		description: item.content.rendered,
		pubDate: parseDate(item.date_gmt),
		link: item.link
	}));
	return {
		title: "Blog - Bitmovin",
		link: `${baseUrl}/blog/`,
		item: items
	};
}
//#endregion
export { route };
