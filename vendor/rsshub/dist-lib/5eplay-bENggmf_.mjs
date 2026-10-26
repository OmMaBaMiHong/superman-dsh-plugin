import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/5eplay/index.ts
const route = {
	path: "/article",
	categories: ["game"],
	example: "/5eplay/article",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["csgo.5eplay.com/", "csgo.5eplay.com/article"] }],
	name: "新闻列表",
	maintainers: ["Dlouxgit"],
	handler,
	url: "csgo.5eplay.com/"
};
async function handler() {
	const { data: response } = await got_default({
		method: "get",
		url: `https://csgo.5eplay.com/api/article?page=1&type_id=0&time=0&order_by=0`
	});
	return {
		title: "5EPLAY",
		link: "https://csgo.5eplay.com/article",
		item: await Promise.all(response.data.list.map((item) => cache_default.tryGet(item.jump_link, async () => {
			const { data: detailResponse } = await got_default({
				method: "get",
				url: item.jump_link
			});
			const $ = load(detailResponse);
			const content = $(".article-text");
			const res = [];
			content.find("> p, > blockquote").each((i, e) => {
				res.push($(e).text());
				const src = $(e).find("img").first().attr("src");
				if (src && !src.includes("data:image/png;base64")) res.push(`<img src=${src} />`);
			});
			return {
				title: item.title,
				description: res.join("<br />"),
				pubDate: parseDate(item.dateline * 1e3),
				link: item.jump_link
			};
		})))
	};
}
//#endregion
export { route };
