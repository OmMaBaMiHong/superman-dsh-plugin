import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as renderDescription } from "./description-Bp9FTgSM.mjs";
import { load } from "cheerio";
//#region lib/routes/techcrunch/news.ts
const host = "https://techcrunch.com";
const route = {
	path: "/news",
	categories: ["new-media"],
	example: "/techcrunch/news",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["techcrunch.com/"] }],
	name: "News",
	maintainers: ["EthanWng97"],
	handler,
	url: "techcrunch.com/"
};
async function handler() {
	const { data } = await got_default(`${host}/wp-json/wp/v2/posts`);
	const items = data.map((item) => {
		const head = item.yoast_head_json;
		const $ = load(item.content.rendered, null, false);
		$(".wp-block-techcrunch-inline-cta").remove();
		return {
			title: item.title.rendered,
			description: renderDescription({
				head,
				rendered: $.html()
			}),
			link: item.link,
			pubDate: parseDate(item.date_gmt)
		};
	});
	return {
		title: "TechCrunch",
		link: host,
		description: "Reporting on the business of technology, startups, venture capital funding, and Silicon Valley.",
		item: items
	};
}
//#endregion
export { route };
