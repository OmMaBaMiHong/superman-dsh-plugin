import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
//#region lib/routes/byteclicks/utils.ts
const parseItem = (data) => data.map((item) => ({
	title: item.title.rendered,
	description: item.content.rendered,
	pubDate: parseDate(item.date_gmt),
	link: item.link
}));
//#endregion
export { parseItem as t };
