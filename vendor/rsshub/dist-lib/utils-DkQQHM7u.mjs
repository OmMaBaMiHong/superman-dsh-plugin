import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/misskon/utils.ts
const ENDPOINT = "https://misskon.com/wp-json/wp/v2";
const getPosts = async (searchParams) => {
	const url = new URL(`${ENDPOINT}/posts?${searchParams}`);
	url.searchParams.append("_embed", "wp:term");
	return (await rofetch(url.href)).map((item) => {
		const $ = load(item.content.rendered);
		$("input").each((_, el) => {
			$(el).replaceWith($(el).attr("value") || "");
		});
		$("script").remove();
		return {
			title: item.title.rendered,
			link: item.link,
			description: $.html(),
			pubDate: timezone(parseDate(item.date_gmt), 0),
			category: item._embedded["wp:term"].flat().filter((x) => x.taxonomy === "post_tag").map((x) => x.name)
		};
	});
};
const getTags = async (slug) => {
	const data = await rofetch(`${ENDPOINT}/tags?slug=${slug}`);
	if (data.length === 0) throw new Error(`Invalid tag slug: ${slug}`);
	return {
		id: data[0].id,
		name: data[0].name,
		link: data[0].link,
		description: data[0].description
	};
};
//#endregion
export { getPosts as n, getTags as r, ENDPOINT as t };
