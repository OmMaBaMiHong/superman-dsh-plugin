import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/fuliba/latest.ts
const route = {
	path: "/latest",
	categories: ["new-media"],
	example: "/fuliba/latest",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["fuliba2023.net/"] }],
	name: "最新",
	maintainers: ["shinemoon"],
	handler,
	url: "fuliba2023.net/"
};
async function handler(ctx) {
	const { data: response } = await got_default("https://fuliba2023.net/wp-json/wp/v2/posts", { searchParams: {
		per_page: ctx.req.query("limit") ?? 100,
		_embed: 1
	} });
	return {
		title: "福利吧",
		link: "https://fuliba2023.net",
		item: response.map((item) => ({
			title: item.title.rendered,
			link: item.link,
			guid: item.guid.rendered,
			description: item.content.rendered,
			pubDate: parseDate(item.date_gmt),
			author: item._embedded.author[0].name
		}))
	};
}
//#endregion
export { route };
