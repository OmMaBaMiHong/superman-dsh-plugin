import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/cara/constant.ts
const HOST = "https://cara.app";
const API_HOST = `${HOST}/api`;
const CDN_HOST = "https://cdn.cara.app";
//#endregion
//#region lib/routes/cara/utils.ts
function customFetch(request, options) {
	return rofetch(request, {
		...options,
		headers: { "user-agent": config.trueUA }
	});
}
async function parseUserData(user) {
	const buildId = await cache_default.tryGet(`${HOST}:buildId`, async () => {
		const $ = load(await customFetch(`${HOST}/explore`));
		return JSON.parse($("#__NEXT_DATA__")?.text() ?? "{}").buildId;
	}, config.cache.routeExpire, false);
	return await cache_default.tryGet(`${HOST}:${user}`, async () => {
		return (await customFetch(`${HOST}/_next/data/${buildId}/${user}.json`)).pageProps.user;
	});
}
async function fetchPortfolioItem(item) {
	const res = await customFetch(`${API_HOST}/posts/${item.postId}`);
	const description = res.data.images.filter((i) => !i.isCoverImg).map((image) => `<img src="${CDN_HOST}/${image.src}" />`).join("<br />");
	return {
		title: res.data.title || res.data.content,
		pubDate: parseDate(res.data.createdAt),
		link: `${HOST}/post/${item.postId}`,
		description
	};
}
//#endregion
export { CDN_HOST as a, API_HOST as i, fetchPortfolioItem as n, HOST as o, parseUserData as r, customFetch as t };
