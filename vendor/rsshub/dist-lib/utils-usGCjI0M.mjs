import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
//#region lib/routes/alistapart/utils.ts
const getData = (url) => rofetch(url);
const getList = (data) => data.map((value) => {
	const { id, title, content, date_gmt, modified_gmt, link, _embedded } = value;
	return {
		id,
		title: title.rendered,
		description: content.rendered,
		link,
		category: _embedded["wp:term"][0].map((v) => v.name),
		author: _embedded.author.map((v) => v.name).join(", "),
		pubDate: timezone(parseDate(date_gmt), 0),
		updated: timezone(parseDate(modified_gmt), 0)
	};
});
//#endregion
export { getList as n, getData as t };
