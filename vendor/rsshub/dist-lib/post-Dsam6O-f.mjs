import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/acg17/post.ts
const host = "http://acg17.com";
const route = {
	path: "/post/all",
	categories: ["anime"],
	example: "/acg17/post/all",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["acg17.com/post"] }],
	name: "全部文章",
	maintainers: ["SunBK201"],
	handler,
	url: "acg17.com/post"
};
async function handler() {
	const list = (await got_default(`${host}/wp-json/wp/v2/posts?per_page=30`)).data;
	return {
		title: "ACG17 - 全部文章",
		link: `${host}/blog`,
		description: "ACG17 - 全部文章",
		item: list.map((item) => ({
			title: item.title.rendered,
			link: item.link,
			pubDate: parseDate(item.date_gmt),
			description: item.content.rendered
		}))
	};
}
//#endregion
export { route };
