import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
//#region lib/routes/8kcos/utils.ts
const SUB_NAME_PREFIX = "8KCosplay";
const SUB_URL = "https://www.8kcosplay.com";
const getPosts = async (limit, options) => {
	return (await rofetch("https://www.8kcosplay.com/wp-json/wp/v2/posts", { query: {
		per_page: limit,
		_embed: "",
		...options
	} })).map((item) => ({
		title: item.title.rendered,
		description: item.content.rendered,
		link: item.link,
		pubDate: parseDate(item.date_gmt),
		author: item._embedded?.author?.map((a) => a.name).join(", "),
		category: item._embedded?.["wp:term"]?.flatMap((terms) => terms.map((t) => t.name))
	}));
};
const getCategoryInfo = (category) => cache_default.tryGet(`8kcosplay:category:${category}`, async () => {
	const categoryInfo = (await rofetch("https://www.8kcosplay.com/wp-json/wp/v2/categories", { query: { slug: category } }))[0];
	if (!categoryInfo) throw new Error("Category not found");
	return {
		id: categoryInfo.id,
		title: categoryInfo.yoast_head_json.title,
		description: categoryInfo.description,
		link: categoryInfo.link
	};
});
const getTagInfo = (tag) => cache_default.tryGet(`8kcosplay:tag:${tag}`, async () => {
	const tagInfo = (await rofetch("https://www.8kcosplay.com/wp-json/wp/v2/tags", { query: { slug: tag } }))[0];
	if (!tagInfo) throw new Error("Tag not found");
	return {
		id: tagInfo.id,
		title: tagInfo.yoast_head_json.title,
		description: tagInfo.description
	};
});
//#endregion
export { getTagInfo as a, getPosts as i, SUB_URL as n, getCategoryInfo as r, SUB_NAME_PREFIX as t };
