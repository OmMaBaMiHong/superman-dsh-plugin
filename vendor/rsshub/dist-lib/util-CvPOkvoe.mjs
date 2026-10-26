import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
//#region lib/routes/ifun/n/util.ts
const author = "趣集";
const language = "zh-CN";
const rootUrl = "https://n.ifun.cool";
const processItems = (items, limit) => items.slice(0, limit).map((item) => {
	const title = item.title;
	const description = item.content;
	const guid = `ifun-n-${item.id}`;
	const author = item.author;
	return {
		title,
		description,
		pubDate: parseDate(item.createtime),
		link: item.id ? new URL(`articles/${item.id}`, rootUrl).href : void 0,
		category: [...new Set([item.category, item.tag].filter(Boolean))],
		author,
		guid,
		id: guid,
		content: {
			html: description,
			text: description
		},
		language
	};
});
//#endregion
export { rootUrl as i, language as n, processItems as r, author as t };
