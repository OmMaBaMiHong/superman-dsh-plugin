import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { load } from "cheerio";
//#region lib/routes/m-78/news.ts
const route = {
	name: "ニュース",
	categories: ["anime"],
	path: "/news/:category?",
	example: "/m-78/news",
	radar: [{
		source: ["m-78.jp/news"],
		target: "/news"
	}, {
		source: ["m-78.jp/news/category/:category"],
		target: "/news/:category"
	}],
	parameters: { category: {
		description: "news category",
		default: "news",
		options: [
			{
				value: "news",
				label: "ニュース"
			},
			{
				value: "streaming",
				label: "動画配信"
			},
			{
				value: "event",
				label: "イベント"
			},
			{
				value: "onair",
				label: "放送"
			},
			{
				value: "broadcast",
				label: "放送/配信"
			},
			{
				value: "goods",
				label: "グッズ"
			},
			{
				value: "ultraman-cardgame",
				label: "ウルトラマン カードゲーム"
			},
			{
				value: "shop",
				label: "ショップ"
			},
			{
				value: "blu-ray_dvd",
				label: "Blu-ray・DVD"
			},
			{
				value: "digital",
				label: "デジタル"
			}
		]
	} },
	handler,
	maintainers: ["KarasuShin"],
	features: { supportRadar: true },
	view: 0
};
async function handler(ctx) {
	const rootUrl = "https://m-78.jp";
	const cateAPIUrl = `${rootUrl}/wp-json/wp/v2/categories`;
	const postsAPIUrl = `${rootUrl}/wp-json/wp/v2/posts`;
	const category = ctx.req.param("category") ?? "news";
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 20;
	const categories = await rofetch(`${cateAPIUrl}?slug=${category}`);
	if (categories.length === 0) throw new InvalidParameterError("Category not found");
	const { id: categoryId, link: categoryLink, name: categoryName } = categories[0];
	const posts = await rofetch(`${postsAPIUrl}?categories=${categoryId}&per_page=${limit}`);
	return {
		title: `${categoryName} | ニュース`,
		link: categoryLink,
		item: posts.map((post) => {
			const $ = load(post.content.rendered, null, false);
			$("#ez-toc-container").remove();
			$("img").each((_, img) => {
				if (/wp-content\/uploads/.test(img.attribs.src)) img.attribs.src = img.attribs.src.replace(/(-\d+x\d+)/, "");
			});
			return {
				title: post.title.rendered,
				link: post.link,
				description: $.html(),
				pubDate: parseDate(post.date_gmt),
				updated: parseDate(post.modified_gmt)
			};
		})
	};
}
//#endregion
export { route };
