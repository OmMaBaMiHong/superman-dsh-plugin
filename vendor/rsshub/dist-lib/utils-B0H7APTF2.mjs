import { t as config } from "./config-B5Cf_tHS.mjs";
//#region lib/routes/smzdm/utils.ts
const getHeaders = () => ({
	accept: "application/json, text/javascript, */*; q=0.01",
	cookie: config.smzdm.cookie,
	"x-requested-with": "XMLHttpRequest"
});
//#endregion
export { getHeaders as t };
