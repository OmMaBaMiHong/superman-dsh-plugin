import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as md5 } from "./md5-CpIHIxCO.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
//#region lib/routes/jingzhengu/utils.ts
function link(str, ...args) {
	let result = args.map((arg) => arg + str).join("");
	if (result.search("-")) result = result.slice(0, Math.max(0, result.length - 1));
	return result;
}
function replaceCharAt(str, index, replacement) {
	return index < 0 || index >= str.length ? str : str.slice(0, index) + replacement + str.slice(index + 1);
}
function sign(payload) {
	const map = /* @__PURE__ */ new Map();
	const lowerCaseKeys = [];
	for (const [key, value] of payload) {
		const lowerCaseKey = key.toLowerCase();
		lowerCaseKeys.push(lowerCaseKey);
		map.set(lowerCaseKey, typeof value === "string" ? value.toLowerCase() : value);
	}
	const sortedString = lowerCaseKeys.toSorted((a, b) => a.localeCompare(b)).map((key) => key + "=" + map.get(key)).join("");
	const linkedString = link("--".slice(0, 1), "#CEAIWER", "892F", "KB97", "JKB6", "HJ7OC7C8", "GJZG");
	return md5((sortedString + replaceCharAt(linkedString, linkedString.lastIndexOf("--".slice(0, 1)), "")).toLowerCase());
}
//#endregion
//#region lib/routes/jingzhengu/news.ts
const route = {
	path: "/news",
	categories: ["other"],
	example: "/jingzhengu/news",
	radar: [{ source: ["www.jingzhengu.com"] }],
	name: "资讯",
	maintainers: ["TonyRL"],
	handler,
	url: "www.jingzhengu.com"
};
async function handler() {
	const baseUrl = "https://www.jingzhengu.com";
	const payload = /* @__PURE__ */ new Map([["pageNo", 1], ["middleware", String(Date.now())]]);
	const list = (await rofetch(`${baseUrl}/news/makeNewsInfo`, {
		method: "POST",
		body: {
			...Object.fromEntries(payload),
			sign: sign(payload)
		}
	})).data.articles.map((item) => ({
		title: item.title,
		description: item.summary,
		link: `${baseUrl}/#/cn/Details_${item.addDate.split(" ", 1)[0].replaceAll("-", "")}${item.id}.html`,
		pubDate: timezone(parseDate(item.addDate, "YYYY-MM-DD HH:mm:ss"), 8),
		author: item.author,
		id: item.id
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const payload = /* @__PURE__ */ new Map([["id", item.id], ["middleware", String(Date.now())]]);
		item.description = (await rofetch(`${baseUrl}/news/makeNewsDetail`, {
			method: "POST",
			body: {
				...Object.fromEntries(payload),
				sign: sign(payload)
			}
		})).data.content;
		return item;
	})));
	return {
		title: "精真估 > 资讯",
		link: `${baseUrl}/#/index/boot`,
		item: items
	};
}
//#endregion
export { route };
