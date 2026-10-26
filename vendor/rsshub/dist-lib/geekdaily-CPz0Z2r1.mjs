import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
//#region lib/routes/rebase/geekdaily.ts
const route = {
	path: "/geekdaily",
	categories: ["new-media"],
	example: "/rebase/geekdaily",
	radar: [{
		source: ["rebase.network/geekdaily"],
		target: "/geekdaily"
	}],
	name: "Web3 Geek Daily",
	maintainers: ["gaoyifan"],
	handler: async () => {
		return {
			title: "Web3 Geek Daily",
			link: "https://rebase.network/geekdaily",
			item: (await rofetch("https://db.rebase.network/api/v1/geekdailies?sort=id:desc")).data.map((item) => ({
				title: item.attributes.title,
				link: item.attributes.url,
				description: item.attributes.introduce,
				pubDate: parseDate(item.attributes.time),
				author: item.attributes.author
			}))
		};
	}
};
//#endregion
export { route };
