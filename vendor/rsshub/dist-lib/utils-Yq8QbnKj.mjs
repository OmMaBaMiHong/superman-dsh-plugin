import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
//#region lib/routes/iplaysoft/utils.ts
const rootUrl = "https://www.iplaysoft.com/";
const fetchTaxonomy = async (slug, type) => {
	const taxonomyUrl = `${rootUrl}wp-json/wp/v2/${type}?slug=${slug}`;
	return await cache_default.tryGet(taxonomyUrl, async () => {
		const taxonomyData = await rofetch(taxonomyUrl);
		if (!taxonomyData[0] || !taxonomyData[0].id || !taxonomyData[0].name) throw new Error(`${type} ${slug} not found`);
		return {
			id: taxonomyData[0].id,
			name: taxonomyData[0].name
		};
	});
};
const fetchCategory = async (categorySlug) => await fetchTaxonomy(categorySlug, "categories");
const fetchTag = async (tagSlug) => await fetchTaxonomy(tagSlug, "tags");
async function fetchNewsItems(apiUrl) {
	return (await rofetch(apiUrl)).map((item) => ({
		title: item.title.rendered,
		description: item.content.rendered,
		link: item.link,
		pubDate: new Date(item.date_gmt).toUTCString(),
		author: item._embedded.author[0].name,
		category: item._embedded["wp:term"].flat().map((term) => term.name)
	}));
}
//#endregion
export { fetchNewsItems as n, fetchTag as r, fetchCategory as t };
