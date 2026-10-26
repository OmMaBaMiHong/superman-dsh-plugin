import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/gov/immiau/news.ts
const url = "https://immi.homeaffairs.gov.au/_layouts/15/api/Data.aspx/GetNews";
const reqBodyByYear = (year) => ({
	siteUrl: "https://www.homeaffairs.gov.au",
	webUrl: "/News-subsite",
	filter: {
		Categories: [],
		PageNumber: 1,
		RowLimit: 20,
		ShowCurrentSiteOnly: false,
		CurrentSite: "Immi",
		Year: year + ""
	}
});
const getItemUrl = (id) => `https://immi.homeaffairs.gov.au/news-media/archive/article?itemId=${id}`;
const route = {
	path: "/news",
	categories: ["government"],
	example: "/gov/immiau/news",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Immigration and Citizenship - News",
	maintainers: ["liu233w"],
	handler
};
async function handler() {
	const { data: res } = await got_default({
		method: "post",
		url,
		json: reqBodyByYear((/* @__PURE__ */ new Date()).getFullYear())
	});
	return {
		title: "News - Immigration and Citizenship",
		link: "https://immi.homeaffairs.gov.au/news-media/archive",
		description: "Australia Government, Department of Home Affairs",
		item: res.d.data.map((item) => ({
			title: item.Title,
			author: item.Source,
			category: item.Category,
			description: item.Content,
			pubDate: parseDate(item.Date),
			link: getItemUrl(item.Id)
		}))
	};
}
//#endregion
export { route };
