import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
import iconv from "iconv-lite";
//#region lib/utils/common-config.ts
function transElemText($, prop) {
	const regex = /\$\(.*\)/;
	let result = prop;
	const parseDate$1 = parseDate;
	const timezone$1 = timezone;
	if (regex.test(result)) result = eval(result);
	return result;
}
function replaceParams(data, prop, $) {
	const regex = /%(.*)%/g;
	let result = prop;
	let group = regex.exec(prop);
	while (group) {
		result = result.replace(group[0], () => transElemText($, data.params[group[1]]));
		group = regex.exec(prop);
	}
	return result;
}
function getProp(data, prop, $) {
	let result = data;
	if (Array.isArray(prop)) for (const e of prop) result = transElemText($, result[e]);
	else result = transElemText($, result[prop]);
	return replaceParams(data, result, $);
}
async function buildData(data) {
	const response = await rofetch.raw(data.url);
	const contentType = response.headers.get("content-type") || "";
	let charset = "utf-8";
	for (const attr of contentType.split(";")) if (attr.includes("charset=")) charset = (attr.split("=").pop() || "utf-8").toLowerCase();
	const $ = load(charset === "utf-8" ? response._data : iconv.decode(await rofetch(data.url, { responseType: "buffer" }), charset));
	const $item = $(data.item.item);
	return {
		link: data.link,
		title: getProp(data, "title", $),
		description: getProp(data, "description", $),
		allowEmpty: data.allowEmpty || false,
		item: $item.toArray().map((e) => {
			const $elem = (selector) => $(e).find(selector);
			return {
				title: getProp(data, ["item", "title"], $elem),
				description: getProp(data, ["item", "description"], $elem),
				pubDate: getProp(data, ["item", "pubDate"], $elem),
				link: getProp(data, ["item", "link"], $elem),
				guid: getProp(data, ["item", "guid"], $elem)
			};
		})
	};
}
//#endregion
export { buildData as t };
