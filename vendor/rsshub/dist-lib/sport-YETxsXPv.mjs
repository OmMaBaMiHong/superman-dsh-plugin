import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { n as fetchBbcContent, t as extractInitialData } from "./utils-DSYLl3sO.mjs";
import { load } from "cheerio";
//#region lib/routes/bbc/sport.ts
const route = {
	path: "/sport/:sport",
	name: "Sport",
	maintainers: ["TonyRL"],
	handler,
	example: "/bbc/sport/formula1",
	parameters: { sport: "The sport to fetch news for, can be found in the URL." },
	radar: [{ source: ["www.bbc.com/sport/:sport"] }],
	categories: ["traditional-media"]
};
async function handler(ctx) {
	const { sport } = ctx.req.param();
	const link = `https://www.bbc.com/sport/${sport}`;
	const initialData = extractInitialData(load(await rofetch(link)));
	const { page } = initialData.stores.metadata;
	const list = Object.values(initialData.data).filter((d) => d.name === "hierarchical-promo-collection" && d.props.title !== "Elsewhere on the BBC").flatMap((d) => d.data.promos).map((item) => ({
		title: item.headline,
		description: item.description,
		link: `https://www.bbc.com${item.url}`,
		pubDate: item.lastPublished ? parseDate(item.lastPublished) : void 0,
		image: item.image?.src.replace("/480/", "/1536/")
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const { category, description } = await fetchBbcContent(item.link, item);
		item.category = category;
		item.description = description;
		return item;
	})));
	return {
		title: page.title,
		description: page.description,
		link,
		image: "https://www.bbc.com/favicon.ico",
		item: items
	};
}
//#endregion
export { route };
