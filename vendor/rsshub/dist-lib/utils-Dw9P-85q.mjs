import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
//#region lib/routes/tfc-taiwan/utils.ts
const baseUrl = "https://tfc-taiwan.org.tw";
const parseItem = (postsResponse) => postsResponse.map((item) => ({
	title: item.title.rendered,
	pubDate: parseDate(item.date_gmt),
	updated: parseDate(item.modified_gmt),
	link: item.link,
	description: item.content.rendered,
	image: item.yoast_head_json.og_image[0].url,
	author: item.author_info.display_name,
	category: item.category_info.map((cat) => cat.name)
}));
const parsePost = (limit, categoryId) => cache_default.tryGet(`tfc-taiwan:posts:${categoryId ?? "latest"}:${limit ?? 10}`, () => rofetch(`${baseUrl}/wp-json/wp/v2/posts`, { query: {
	categories: categoryId,
	per_page: limit
} }));
//#endregion
export { parseItem as n, parsePost as r, baseUrl as t };
