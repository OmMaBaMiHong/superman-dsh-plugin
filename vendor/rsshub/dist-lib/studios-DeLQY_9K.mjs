import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { n as outPlaywright } from "./playwright-DGfbX7qN.mjs";
import { i as playwrightFetch, n as getItem, r as parseList, t as baseUrl } from "./utils-Dzwiht9d.mjs";
//#region lib/routes/javtrailers/studios.ts
const route = {
	path: "/studios/:studio",
	categories: ["multimedia"],
	example: "/javtrailers/studios/s1-no-1-style",
	parameters: { studio: "Studio name, can be found in the URL of the studio page" },
	radar: [{ source: ["javtrailers.com/studios/:category"] }],
	name: "Studios",
	maintainers: ["TonyRL"],
	handler,
	features: {
		nsfw: true,
		requirePuppeteer: true
	}
};
async function handler(ctx) {
	const { studio } = ctx.req.param();
	const context = await outPlaywright();
	const response = await playwrightFetch(`${baseUrl}/api/studios/${studio}?page=0`, context);
	const list = parseList(response.videos);
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, () => getItem(item, context))));
	await context.close();
	return {
		title: `${response.studio.hotDvdIds?.join(" ") ?? response.studio.name} Jav Online | Japanese Adult Video - JavTrailers.com`,
		description: "Watch Jav made by Prestige free, with high definition, we have over 4,000 studios available for free streaming.",
		link: `${baseUrl}/studios/${studio}`,
		item: items
	};
}
//#endregion
export { route };
