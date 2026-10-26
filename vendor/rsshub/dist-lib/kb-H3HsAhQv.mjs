import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import * as cheerio from "cheerio";
//#region lib/routes/cas/mesalab/kb.ts
const route = {
	path: "/mesalab/kb",
	categories: ["university"],
	example: "/cas/mesalab/kb",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.mesalab.cn/f/article/articleList", "www.mesalab.cn/"] }],
	name: "信息工程研究所 第二研究室 处理架构组 知识库",
	maintainers: ["renzhexigua"],
	handler,
	url: "www.mesalab.cn/f/article/articleList"
};
async function handler() {
	const homepage = "https://www.mesalab.cn";
	const url = `${homepage}/f/article/articleList?pageNo=1&pageSize=15&createTimeSort=DESC`;
	const response = await got_default(url);
	const $ = cheerio.load(response.data);
	const articles = $(".aw-item").toArray();
	return {
		title: "MESA 知识库",
		description: "中国科学院信息工程研究所 第二研究室 处理架构组",
		link: url,
		item: await Promise.all(articles.map((item) => {
			const a = $(item).find("a").first();
			const title = a.text().trim();
			const link = `${homepage}${a.attr("href")}`;
			return cache_default.tryGet(link, async () => {
				const result = await got_default(link);
				const $ = cheerio.load(result.data);
				return {
					title,
					author: $(".user_name").text(),
					pubDate: timezone(parseDate($(".link_postdate").text().replaceAll(/\s+/g, " ")), 8),
					description: $("#article_content").html() + ($(".attachment").length ? $(".attachment").html() : ""),
					link,
					category: $(".category .category_r span").first().text()
				};
			});
		}))
	};
}
//#endregion
export { route };
