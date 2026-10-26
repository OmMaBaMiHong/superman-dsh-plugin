import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/kisskiss/blog.ts
const baseUrl = "https://www.kisskiss.tv/kiss/diary.php";
const route = {
	path: "/blog/:category?",
	categories: ["game"],
	example: "/kisskiss/blog/DLC",
	parameters: { category: "category" },
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
		source: ["www.kisskiss.tv/kiss/diary.php"],
		target: "/blog"
	}],
	name: "ブログ",
	maintainers: ["keocheung"],
	handler
};
async function handler(ctx) {
	const { category } = ctx.req.param();
	const url = category ? `${baseUrl}?category=${category}` : baseUrl;
	const $ = load((await got_default(url)).data);
	return {
		title: "KISS ブログ",
		link: url,
		item: $("table.blog_frame_top").toArray().map((item) => {
			const title = $(item);
			const body = title.next("div.blog_frame_middle");
			const i = {
				title: title.find("tbody tr td").text(),
				link: title.find("tbody tr td a").attr("href"),
				pubDate: timezone(parseDate(body.find("div.blog_data div.data_r").text().match(/\d+年\d+月\d+日 \(\d+:\d+\)/)[0], "YYYY年M月D日 (HH:mm)"), 9)
			};
			body.find("a img").each((_, el) => {
				$(el).attr("src", $(el).parent("a").attr("href"));
				$(el).unwrap();
			});
			body.find("div.blog_data").remove();
			i.description = `<div lang="ja-JP">${body.html()}</div>`;
			return i;
		}),
		language: "ja"
	};
}
//#endregion
export { route };
