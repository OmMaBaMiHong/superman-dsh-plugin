import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/ieee-security/sp.ts
const url = "https://www.ieee-security.org/";
const route = {
	path: "/security-privacy",
	categories: ["journal"],
	example: "/ieee-security/security-privacy",
	radar: [{ source: ["ieee-security.org/TC/SP-Index.html", "ieee-security.org/"] }],
	name: "IEEE Symposium on Security and Privacy",
	maintainers: ["ZeddYu"],
	handler,
	url: "ieee-security.org/TC/SP-Index.html",
	description: "Return results from 2020"
};
async function handler() {
	const last = (/* @__PURE__ */ new Date()).getFullYear() + 1;
	const urlList = Array.from({ length: last - 2020 }, (_, v) => `${url}TC/SP${v + 2020}/program-papers.html`);
	const items = (await Promise.allSettled(urlList.map((url) => rofetch(url)))).flatMap((response, i) => {
		const $ = load(response.value);
		return $("div.panel-body > div.list-group-item").toArray().map((item) => {
			item = $(item);
			const title = item.find("b").text().trim();
			const link = urlList[i];
			return {
				title,
				author: item.html().trim().split("<br>", 2)[1].trim(),
				link: `${link}#${title}`,
				pubDate: parseDate(link.match(/SP(\d{4})/)[1], "YYYY")
			};
		});
	});
	return {
		title: "S&P",
		link: `${url}TC/SP-Index.html`,
		description: "IEEE Symposium on Security and Privacy Accepted Papers",
		allowEmpty: true,
		item: items
	};
}
//#endregion
export { route };
