//#region lib/routes/swpu/utils.ts
function isCompleteUrl(url) {
	return /^\w+:\/\/.*?\//.test(url);
}
function joinUrl(url1, url2) {
	if (isCompleteUrl(url2)) return url2;
	if (!url1.endsWith("/")) url1 += "/";
	if (url2.startsWith("/")) url2 = url2.slice(1);
	return url1 + url2;
}
//#endregion
export { joinUrl as t };
