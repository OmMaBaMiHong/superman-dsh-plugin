import "node:path";
import "node:url";
import { stringifyQuery } from "ufo";
//#region lib/utils/helpers.ts
const getRouteNameFromPath = (path) => {
	const p = path.split("/").filter(Boolean);
	if (p.length > 0) return p[0];
	return null;
};
const getPath = (request) => {
	const match = request.url.match(/^https?:\/\/[^/]+(\/[^?]*)/);
	return match ? match[1] : "";
};
const humanize = (times) => {
	const [delimiter, separator] = [",", "."];
	return times.map((v) => v.replaceAll(/(\d)(?=(\d{3})+(?!\d))/g, (_match, p1) => p1 + delimiter)).join(separator);
};
const time = (start) => {
	const delta = Date.now() - start;
	return humanize([delta < 1e3 ? delta + "ms" : Math.round(delta / 1e3) + "s"]);
};
function isPureObject(o) {
	return Object.prototype.toString.call(o) === "[object Object]";
}
function getSearchParamsString(searchParams) {
	return (isPureObject(searchParams) ? stringifyQuery(searchParams) : null) ?? new URLSearchParams(searchParams).toString();
}
/**
* parse duration string to seconds
* @param {string} timeStr - duration string like "01:01:01" / "01:01" / "59"
* @returns {number}       - total seconds
*/
function parseDuration(timeStr) {
	if (!timeStr) return;
	const parts = timeStr.trim().replaceAll(/[^\d:]/g, "").split(":");
	let total = 0;
	for (const [idx, part] of parts.entries()) {
		const n = Number(part);
		if (Number.isNaN(n)) throw new TypeError(`Invalid segment: ${part}`);
		total += n * Math.pow(60, parts.length - 1 - idx);
	}
	return total;
}
//#endregion
export { time as a, parseDuration as i, getRouteNameFromPath as n, getSearchParamsString as r, getPath as t };
