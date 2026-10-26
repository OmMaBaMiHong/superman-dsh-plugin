import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/plurk/utils.ts
const baseUrl = "https://www.plurk.com";
/**
*
* @param {objects} userIds Array of user ids
* @returns
*/
const fetchFriends = async (userIds) => {
	const { data } = await got_default.post(`${baseUrl}/Users/fetchFriends`, { form: {
		ids: JSON.stringify(userIds),
		r: "gp"
	} });
	return data;
};
/**
*
* @param {string} plurkGuid plurk guid, should start with 'plurk:'
* @param {object} item plurk object
* @param {string} author author name, can be `null`
* @returns {object} item object
*/
const getPlurk = (plurkGuid, item, author) => cache_default.tryGet(plurkGuid, () => {
	const $ = load(item.content || item.rendered, null, false);
	$("img").each((_, e) => {
		e = $(e);
		e.removeAttr("height").removeAttr("width");
		if (e.attr("alt") && e.attr("alt").startsWith("http")) {
			e.attr("src", e.attr("alt"));
			e.removeAttr("alt");
		}
	});
	return {
		title: item.content_raw ?? ($.text() || plurkGuid),
		description: $.html(),
		guid: plurkGuid,
		link: item.rendered ? item.link_url : null,
		author,
		pubDate: parseDate(item.posted)
	};
});
//#endregion
export { fetchFriends as n, getPlurk as r, baseUrl as t };
