import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/iheima/index.ts
const route = {
	path: "/recommend",
	categories: ["new-media"],
	example: "/iheima/recommend",
	url: "www.iheima.com",
	name: "推荐",
	maintainers: ["p3psi-boo"],
	handler
};
async function handler() {
	const baseUrl = "https://www.iheima.com/?page=1&pagesize=20";
	const response = await got_default({
		method: "get",
		url: baseUrl,
		responseType: "json",
		headers: {
			Accept: "application/json, text/javascript, */*; q=0.01",
			Referer: "https://www.iheima.com/",
			"X-Requested-With": "XMLHttpRequest"
		}
	});
	return {
		title: "推荐",
		link: baseUrl,
		item: JSON.parse(response.body).contents.map((item) => ({
			title: item.title,
			link: item.url,
			pubDate: parseDate(item.published),
			description: item.content
		}))
	};
}
//#endregion
export { route };
