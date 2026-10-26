import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
//#region lib/routes/wellcee/utils.ts
const baseUrl = "https://www.wellcee.com";
const getCitys = () => cache_default.tryGet("wellcee:citys", async () => {
	return (await rofetch(`${baseUrl}/api/home/index`, {
		method: "POST",
		headers: { "content-type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams({
			lang: "1",
			userId: "",
			type: "1"
		}).toString()
	})).data.citys;
}, config.cache.routeExpire, false);
const getDistricts = (cityId) => cache_default.tryGet(`wellcee:city:${cityId}`, async () => {
	return (await rofetch(`${baseUrl}/api/house/filterType`, { query: {
		cityId,
		lang: "1"
	} })).data.district;
}, config.cache.routeExpire, false);
//#endregion
export { getCitys as n, getDistricts as r, baseUrl as t };
