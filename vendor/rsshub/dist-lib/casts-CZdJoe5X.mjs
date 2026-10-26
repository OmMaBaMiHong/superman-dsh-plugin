import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { n as outPlaywright } from "./playwright-DGfbX7qN.mjs";
import { i as playwrightFetch, n as getItem, r as parseList, t as baseUrl } from "./utils-Dzwiht9d.mjs";
//#region lib/routes/javtrailers/casts.ts
const route = {
	path: "/casts/:cast",
	categories: ["multimedia"],
	example: "/javtrailers/casts/hibiki-otsuki",
	parameters: { cast: "Cast name, can be found in the URL of the cast page" },
	radar: [{ source: ["javtrailers.com/casts/:category"] }],
	name: "Casts",
	maintainers: ["TonyRL"],
	url: "javtrailers.com/casts",
	handler,
	features: {
		nsfw: true,
		requirePuppeteer: true
	}
};
async function handler(ctx) {
	const { cast } = ctx.req.param();
	const context = await outPlaywright();
	const response = await playwrightFetch(`${baseUrl}/api/casts/${cast}?page=0`, context);
	const list = parseList(response.videos);
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, () => getItem(item, context))));
	await context.close();
	return {
		title: `Watch ${response.cast.name} Jav Online | Japanese Adult Video - JavTrailers.com`,
		description: response.cast.castWiki?.description.replaceAll("\n", " ") ?? `Watch ${response.cast.name} Jav video’s free, we have the largest Jav collections with high definition`,
		image: response.cast.avatar,
		link: `${baseUrl}/casts/${cast}`,
		item: items
	};
}
//#endregion
export { route };
