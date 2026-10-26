import "./types-DNj6Etbg.mjs";
import { n as parseNewsList, r as rootUrl, t as parseArticle } from "./utils-DCnpvwsm.mjs";
import pMap from "p-map";
//#region lib/routes/bloomberg/index.ts
const siteTitleMapping = {
	"/": "News",
	bpol: "Politics",
	bbiz: "Business",
	markets: "Markets",
	technology: "Technology",
	green: "Green",
	wealth: "Wealth",
	pursuits: "Pursuits",
	bview: "Opinion",
	equality: "Equality",
	businessweek: "Businessweek",
	citylab: "CityLab"
};
const route = {
	path: "/:site?",
	categories: ["finance"],
	view: 0,
	example: "/bloomberg/bbiz",
	parameters: { site: {
		description: "Site ID, can be found below",
		options: Object.entries(siteTitleMapping).map(([key, value]) => ({
			value: key,
			label: value
		}))
	} },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Bloomberg Site",
	maintainers: ["bigfei"],
	description: `| Site ID      | Title        |
| ------------ | ------------ |
| /            | News         |
| bpol         | Politics     |
| bbiz         | Business     |
| markets      | Markets      |
| technology   | Technology   |
| green        | Green        |
| wealth       | Wealth       |
| pursuits     | Pursuits     |
| bview        | Opinion      |
| equality     | Equality     |
| businessweek | Businessweek |
| citylab      | CityLab      |`,
	handler
};
async function handler(ctx) {
	const site = ctx.req.param("site");
	const currentUrl = site ? `${rootUrl}/${site}/sitemap_news.xml` : `${rootUrl}/sitemap_news.xml`;
	const items = await pMap(await parseNewsList(currentUrl, ctx), (item) => parseArticle(item), { concurrency: 1 });
	return {
		title: `Bloomberg - ${siteTitleMapping[site ?? "/"]}`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
