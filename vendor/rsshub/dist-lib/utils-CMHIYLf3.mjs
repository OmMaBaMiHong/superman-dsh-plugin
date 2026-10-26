import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/cde/utils.ts
const title = "国家药品监督管理局药品审评中心";
const rootUrl = "https://www.cde.org.cn";
const getCookie = () => cache_default.tryGet("cde:cookie", async () => {
	return (await got_default(rootUrl)).headers["set-cookie"].join(",").match(/FSSBBIl1UgzbN7N80.*?;/g).join("");
});
var utils_default = {
	title,
	rootUrl,
	getCookie
};
//#endregion
export { utils_default as t };
