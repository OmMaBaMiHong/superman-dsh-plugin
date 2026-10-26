import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#endregion
//#region lib/routes/letterboxd/index.ts
const baseUrl = `https://${{
	name: "Letterboxd",
	url: "letterboxd.com",
	categories: ["social-media"],
	lang: "en"
}.url}`;
const route = {
	path: "/:username/watchlist",
	categories: ["social-media"],
	example: "/letterboxd/matthew/watchlist",
	parameters: { username: "Letterboxd username" },
	radar: [{ source: ["letterboxd.com/:username/watchlist/"] }],
	name: "User Watchlist",
	maintainers: ["johan456789"],
	handler,
	url: "letterboxd.com"
};
async function handler(ctx) {
	const { username } = ctx.req.param();
	const currentUrl = `${baseUrl}/${username}/watchlist/`;
	const $ = load(await rofetch(currentUrl));
	const wrappers = $("div.react-component[data-component-class*=\"LazyPoster\"]").toArray();
	const items = await Promise.all(wrappers.map(async (el) => {
		const wrapper = $(el);
		const linkPath = wrapper.attr("data-item-link") || wrapper.attr("data-target-link") || "";
		const link = linkPath ? new URL(linkPath, baseUrl).href : void 0;
		const title = wrapper.attr("data-item-full-display-name") || wrapper.attr("data-item-name") || "";
		let image;
		if (link) {
			const posterApiUrl = `${link}poster/std/125/`;
			const cacheKey = `letterboxd:poster:${posterApiUrl}`;
			const posterData = await cache_default.tryGet(cacheKey, () => rofetch(posterApiUrl, { responseType: "json" }));
			image = posterData.url2x || posterData.url;
		}
		return {
			title,
			link,
			image
		};
	}));
	return {
		title: $("title").text().trim().replaceAll("‎", "") || `${username}'s Watchlist • Letterboxd`,
		link: currentUrl,
		item: items,
		allowEmpty: true
	};
}
//#endregion
export { route };
