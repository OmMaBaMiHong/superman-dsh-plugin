import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import CryptoJS from "crypto-js";
//#region lib/routes/stream-capital/utils.ts
const secret = CryptoJS.enc.Utf8.parse("r4rt5A8L6ye6ts8y");
const iv = CryptoJS.enc.Utf8.parse("fs0Hkjg8a23u8sE0");
const encrypt = (plainText) => CryptoJS.AES.encrypt(plainText, secret, {
	iv,
	mode: CryptoJS.mode.CBC,
	padding: CryptoJS.pad.Pkcs7
}).toString();
const decrypt = (encrypted) => CryptoJS.AES.decrypt(encrypted, secret, {
	iv,
	mode: CryptoJS.mode.CBC,
	padding: CryptoJS.pad.Pkcs7
}).toString(CryptoJS.enc.Utf8);
//#endregion
//#region lib/routes/stream-capital/search.ts
const route = {
	path: "/search",
	name: "最新",
	categories: ["finance"],
	example: "/stream-capital/search",
	maintainers: ["TonyRL"],
	handler,
	radar: [{ source: ["www.stream-capital.com/search"] }]
};
async function handler() {
	const baseUrl = "https://www.stream-capital.com";
	const apiBaseUrl = "https://api.yuanchuan.cn";
	const response = await rofetch(`${apiBaseUrl}/yc/webbloglist`, {
		method: "POST",
		query: { apptype: 9 },
		body: encrypt(JSON.stringify({
			type: 0,
			name: null,
			page: 1
		}))
	});
	const list = JSON.parse(decrypt(response.data)).list.map((item) => ({
		title: item.title,
		author: item.userName,
		pubDate: timezone(parseDate(item.ctime, "YYYY-MM-DD HH:mm:ss"), 8),
		link: `${baseUrl}/article/${item.id}`,
		description: item.content,
		category: item.tags.map((t) => t.tagName),
		id: item.id
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const response = await rofetch(`${apiBaseUrl}/yc/webblogdetail`, {
			method: "POST",
			query: { apptype: 9 },
			body: encrypt(JSON.stringify({ blogId: item.id }))
		});
		item.description = JSON.parse(decrypt(response.data)).detailInfo.articleContent;
		return item;
	})));
	return {
		title: "最新 - 远川研究所",
		link: `${baseUrl}/search`,
		language: "zh",
		item: items
	};
}
//#endregion
export { route };
