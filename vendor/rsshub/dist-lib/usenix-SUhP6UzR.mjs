import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/usenix/usenix.ts
const url = "https://www.usenix.org";
const seasons = [
	"spring",
	"summer",
	"fall",
	"winter"
];
const route = {
	path: "/usenix-security-sympoium",
	categories: ["journal"],
	example: "/usenix/usenix-security-sympoium",
	radar: [{ source: [
		"usenix.org/conferences/all",
		"usenix.org/conferences",
		"usenix.org/"
	] }],
	name: "Security Symposia",
	maintainers: ["ZeddYu"],
	handler,
	url: "usenix.org/conferences/all",
	description: "Return results from 2020"
};
async function handler() {
	const last = (/* @__PURE__ */ new Date()).getFullYear() + 1;
	const urlList = Array.from({ length: last - 2020 }, (_, v) => `${url}/conference/usenixsecurity${v + 20}`).flatMap((url) => seasons.map((season) => `${url}/${season}-accepted-papers`));
	const list = (await Promise.allSettled(urlList.map(async (url) => {
		let res;
		try {
			res = await rofetch(url);
		} catch {}
		return res;
	}))).filter((r) => r.status === "fulfilled" && r.value).flatMap((response) => {
		const $ = load(response.value);
		const pubDate = parseDate($("meta[property=article:modified_time]").attr("content"));
		return $("article.node-paper").toArray().map((item) => {
			item = $(item);
			return {
				title: item.find("h2.node-title > a").text().trim(),
				link: `${url}${item.find("h2.node-title > a").attr("href")}`,
				author: item.find("div.field.field-name-field-paper-people-text.field-type-text-long.field-label-hidden p").text().trim(),
				pubDate
			};
		});
	});
	const items = await Promise.allSettled(list.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = load(await rofetch(item.link))(".content").html();
		return item;
	})));
	return {
		title: "USENIX",
		link: url,
		description: "USENIX Security Symposium Accpeted Papers",
		allowEmpty: true,
		item: items.filter((r) => r.status === "fulfilled").map((r) => r.value)
	};
}
//#endregion
export { route };
