import "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import title from "title";
//#region lib/utils/common-utils.ts
const toTitleCase = (str) => title(str);
const rWhitespace = /\s+/;
const rAllWhitespace = /\s+/g;
const collapseWhitespace = (str) => {
	if (str && rWhitespace.test(str)) return str.replaceAll(rAllWhitespace, " ").trim();
	return str;
};
const convertDateToISO8601 = (date) => {
	if (!date) return date;
	if (typeof date !== "object") date = parseDate(date);
	return date.toISOString();
};
const getSubPath = (ctx) => {
	return ctx.req.path.replace(/\/[^/]*/, "") || "/";
};
//#endregion
export { toTitleCase as i, convertDateToISO8601 as n, getSubPath as r, collapseWhitespace as t };
