import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as renderProductDescription, t as generateRssData } from "./utils-D9ygj7-5.mjs";
//#region lib/routes/arcteryx/outlet.ts
const route = {
	path: "/outlet/:country/:gender",
	categories: ["shopping"],
	example: "/arcteryx/outlet/us/mens",
	parameters: {
		country: "country",
		gender: "gender"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["outlet.arcteryx.com/:country/en/c/:gender"] }],
	name: "Outlet",
	maintainers: ["EthanWng97"],
	handler,
	description: `Country

| United States | Canada | United Kingdom |
| ------------- | ------ | -------------- |
| us            | ca     | gb             |

gender

| male | female |
| ---- | ------ |
| mens | womens |

::: tip
Parameter \`country\` can be found within the url of \`Arcteryx\` website.
:::`
};
async function handler(ctx) {
	const { country, gender } = ctx.req.param();
	const host = `https://outlet.arcteryx.com/${country}/en/`;
	const url = `${host}api/fredhopper/query`;
	const productUrl = `${host}shop/`;
	const pageUrl = `${host}c/${gender}`;
	const items = (await got_default({
		method: "get",
		url,
		searchParams: {
			fh_location: `//catalog01/en_CA/gender>{${gender}}`,
			fh_country: country,
			fh_review: "lister",
			fh_view_size: "all",
			fh_context_location: "//catalog01"
		}
	})).data.universes.universe[1]["items-section"].items.item.map((item, index, arr) => generateRssData(item, index, arr, country));
	return {
		title: `Arcteryx - Outlet(${country.toUpperCase()}) - ${gender.toUpperCase()}`,
		link: pageUrl,
		description: `Arcteryx - Outlet(${country.toUpperCase()}) - ${gender.toUpperCase()}`,
		item: items.map((item) => ({
			title: item.name,
			link: productUrl + item.slug,
			description: renderProductDescription(item)
		}))
	};
}
//#endregion
export { route };
