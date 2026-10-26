import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/tokeninsight/bulletin.ts
const baseURL = "https://www.tokeninsight.com/";
const title = "TokenInsight";
const link = "https://www.tokeninsight.com/";
const get_articles = async () => {
	const url = `${baseURL}api/bulletin/selectBulletinList`;
	const { data } = (await got_default.get(url)).data;
	return data;
};
const route = {
	path: "/bulletin/:lang?",
	categories: ["finance"],
	example: "/tokeninsight/bulletin/en",
	parameters: { lang: "Language, see below, Chinese by default" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["tokeninsight.com/:lang/latest"],
		target: "/bulletin/:lang"
	}],
	name: "Latest",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const lang = ctx.req.param("lang") ?? "zh";
	const get_article_info = async (article) => {
		const { updateDate, titleEn, id, title } = article;
		const articleUrl = `${baseURL}${lang}/latest/${id}`;
		const description = await cache_default.tryGet(articleUrl, async () => {
			return load((await got_default(articleUrl)).data)(".detail_html_box").html();
		});
		return {
			title: lang === "zh" ? title : titleEn,
			description,
			pubDate: parseDate(updateDate),
			link: articleUrl
		};
	};
	const articles = await get_articles();
	const list = await Promise.all(articles.map((element) => get_article_info(element)));
	return {
		title: `${lang === "zh" ? "快讯" : "Latest"} | ${title}`,
		link: `${link}${lang}/latest`,
		item: list
	};
}
//#endregion
export { route };
