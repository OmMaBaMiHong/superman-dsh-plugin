import CryptoJS from "crypto-js";
//#region lib/routes/cls/utils.ts
const rootUrl = "https://www.cls.cn";
const params = {
	appName: "CailianpressWeb",
	os: "web",
	sv: "8.7.9"
};
const getSearchParams = (moreParams) => {
	const filtered = Object.fromEntries(Object.entries({
		...params,
		...moreParams
	}).filter(([_, v]) => v !== void 0));
	const searchParams = new URLSearchParams(filtered);
	searchParams.sort();
	const sha1 = CryptoJS.SHA1(searchParams.toString()).toString();
	searchParams.append("sign", CryptoJS.MD5(sha1).toString());
	return Object.fromEntries(searchParams);
};
//#endregion
export { rootUrl as n, getSearchParams as t };
