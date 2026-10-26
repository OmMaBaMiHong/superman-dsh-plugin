import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
//#region lib/routes/stockedge/utils.ts
const baseUrl = "https://web.stockedge.com/share/";
const getData = (url) => rofetch(url, { headers: {
	Host: "api.stockedge.com",
	Origin: "https://web.stockedge.com",
	Referer: "https://web.stockedge.com/",
	accept: "application/json, text/plain, */*"
} });
const getList = (data) => data.map((value) => {
	const { ID, Description: title, Date: createdOn, NewsitemSecurities, NewsitemSectors, NewsitemIndustries } = value;
	const securityID = NewsitemSecurities?.[0]?.SecurityID;
	const securitySlug = NewsitemSecurities?.[0]?.SecuritySlug;
	const sectors = NewsitemSectors.map((v) => v.SectorName);
	const industries = NewsitemIndustries.map((v) => v.IndustryName);
	return {
		id: ID,
		title: `${title}  [${sectors.join(", ")}]`,
		description: title,
		securityID,
		link: NewsitemSecurities?.length === 0 ? "" : `${baseUrl}${securitySlug}/${securityID}?section=news`,
		guid: NewsitemSecurities?.length === 0 ? ID : `${baseUrl}${securitySlug}/${securityID}`,
		pubDate: parseDate(createdOn),
		category: [...industries, ...sectors]
	};
});
//#endregion
//#region lib/routes/stockedge/daily-news.ts
const route = {
	path: "/daily-updates/news",
	categories: ["finance"],
	view: 5,
	example: "/stockedge/daily-updates/news",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["web.stockedge.com/daily-updates/news"] }],
	name: "Daily Updates News",
	maintainers: ["Rjnishant530"],
	handler,
	url: "web.stockedge.com/daily-updates/news"
};
async function handler() {
	const baseUrl = "https://web.stockedge.com/daily-updates?section=news";
	const apiPath = "https://api.stockedge.com/Api/DailyDashboardApi/GetLatestNewsItems";
	const apiInfo = "https://api.stockedge.com/Api/SecurityDashboardApi/GetSecurityOverview";
	const list = getList(await getData(apiPath));
	return {
		title: "Stock Edge",
		link: baseUrl,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			if (!item.securityID) return item;
			const info = await getData(`${apiInfo}/${item.securityID}`);
			item.description = item.description + "<br><br>" + info?.AboutCompanyText;
			return item;
		}))),
		description: "Daily Updates on stockedge.com",
		logo: "https://web.stockedge.com/assets/icon/favicon.png",
		icon: "https://web.stockedge.com/assets/img/light/icon.png",
		language: "en-us"
	};
}
//#endregion
export { route };
