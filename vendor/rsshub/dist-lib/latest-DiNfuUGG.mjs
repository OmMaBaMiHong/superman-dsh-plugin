import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/towardsdatascience/latest.ts
const route = {
	path: "/latest",
	categories: ["blog"],
	example: "/towardsdatascience/latest",
	radar: [{ source: ["towardsdatascience.com/"] }],
	name: "Towards Data Science",
	maintainers: ["mintyfrankie"],
	url: "towardsdatascience.com/latest",
	handler
};
async function handler() {
	const baseUrl = "https://towardsdatascience.com/latest";
	const feedLang = "en";
	const feedDescription = "Latest articles from Towards Data Science";
	const response = await rofetch("https://medium.com/towards-data-science/latest?posts=true", { headers: { accept: "application/json" } });
	const data = JSON.parse(response.slice(16));
	const list = data.payload.posts.map((item) => {
		return {
			title: item.title,
			link: `https://towardsdatascience.com/${item.uniqueSlug}`,
			freediumLink: `https://freedium.cfd/https://towardsdatascience.com/${item.uniqueSlug}`,
			author: data.payload.references.User[item.creatorId].name,
			pubDate: parseDate(item.createdAt)
		};
	});
	return {
		title: "Towards Data Science - Latest",
		language: feedLang,
		description: feedDescription,
		link: baseUrl,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.freediumLink, async () => {
			item.description = load(await rofetch(item.freediumLink))("div.main-content").first().html();
			return item;
		})))
	};
}
//#endregion
export { route };
