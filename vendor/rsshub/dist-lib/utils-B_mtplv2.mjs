import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { s as solveWafChallenge } from "./utils-Cov4AAq8.mjs";
import { load } from "cheerio";
import CryptoJS from "crypto-js";
//#region lib/routes/36kr/utils.ts
const rootUrl = "https://www.36kr.com";
const ProcessItem = (item) => cache_default.tryGet(item.link, async () => {
	const detailResponse = await rofetch(item.link);
	const cipherTextList = detailResponse.match(/\{"state":"(.*)","isEncrypt":true\}/) ?? [];
	if (cipherTextList.length === 0) item.description = load(detailResponse)("div.articleDetailContent").html();
	else {
		const key = CryptoJS.enc.Utf8.parse("efabccee-b754-4c");
		item.description = JSON.parse(CryptoJS.AES.decrypt(cipherTextList[1], key, {
			mode: CryptoJS.mode.ECB,
			padding: CryptoJS.pad.Pkcs7
		}).toString(CryptoJS.enc.Utf8).toString()).articleDetail.articleDetailData.data.widgetContent;
	}
	return item;
});
const getWafTokenId = () => cache_default.tryGet("36kr:_waftokenid", async () => {
	const payload = load(await rofetch(rootUrl))("script").text().match(/atob\('(.*?)'\)\),/)?.[1];
	const response = solveWafChallenge(payload);
	return (await rofetch.raw(rootUrl, {
		headers: { Cookie: `_wafchallengeid=${response};` },
		redirect: "manual"
	})).headers.getSetCookie().find((cookie) => cookie.startsWith("_waftokenid="))?.split(";", 1)[0].split("=", 2)[1];
}, 300, false);
//#endregion
export { getWafTokenId as n, rootUrl as r, ProcessItem as t };
