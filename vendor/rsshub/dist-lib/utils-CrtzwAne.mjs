import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
//#region lib/routes/jamesclear/utils.ts
const rootUrl = "https://jamesclear.com";
const apiUrl = `${rootUrl}/wp-json/wp/v2`;
async function fetchContent(endpoint) {
	return await rofetch(`${apiUrl}/${endpoint}`);
}
function processItem(item) {
	return {
		title: item.title.rendered,
		link: item.link,
		description: item.content.rendered,
		pubDate: parseDate(item.date_gmt),
		author: "James Clear",
		guid: item.guid.rendered
	};
}
//#endregion
export { processItem as n, rootUrl as r, fetchContent as t };
