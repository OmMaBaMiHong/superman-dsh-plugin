import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/makerworld/utils.ts
const baseUrl = "https://makerworld.com";
const getNextBuildId = () => cache_default.tryGet("makerworld:nextBuildId", async () => {
	const $ = load(await rofetch(`${baseUrl}/en`, { headers: { "User-Agent": config.trueUA } }));
	return JSON.parse($("script#__NEXT_DATA__").text()).buildId;
});
//#endregion
export { getNextBuildId as n, baseUrl as t };
