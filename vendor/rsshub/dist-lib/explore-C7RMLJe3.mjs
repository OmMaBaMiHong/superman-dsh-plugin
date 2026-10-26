import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as md5 } from "./md5-CpIHIxCO.mjs";
import crypto from "node:crypto";
import sanitizeHtml from "sanitize-html";
import CryptoJS from "crypto-js";
//#region lib/routes/pubscholar/utils.ts
const salt = "6m6pingbinwaktg227gngifoocrfbo95";
const key = CryptoJS.enc.Utf8.parse("eRtYuIoPaSdFgHqW");
const iv = CryptoJS.enc.Utf8.parse("Nmc09JkLzX8765Vb");
const baseUrl = "https://pubscholar.cn";
const sha1 = (str) => crypto.createHash("sha1").update(str).digest("hex");
const uuidv4 = () => crypto.randomUUID();
const generateNonce = (length) => {
	if (!length) return null;
	let nonce = "";
	while (nonce.length < length) {
		const randomString = Math.random().toString(36).slice(2).toUpperCase();
		nonce += randomString;
	}
	return nonce.slice(0, length);
};
/**
* Part of fingerprint2.js shim from uBlock Origin
* Taken from https://github.com/gorhill/uBlock/blob/master/src/web_accessible_resources/fingerprint2.js
* @param len
* @returns
*/
const hex32 = (len) => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16).slice(-len).padStart(len, "0");
const getSignedHeaders = () => {
	const nonce = generateNonce(6);
	const timestamp = Date.now().toString();
	return {
		nonce,
		timestamp,
		signature: sha1([
			salt,
			timestamp,
			nonce
		].toSorted().join("")),
		"x-finger": `${hex32(8)}${hex32(8)}${hex32(8)}${hex32(8)}`
	};
};
const getArticleLink = (id) => {
	return CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(id), key, {
		iv,
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7
	}).ciphertext.toString();
};
//#endregion
//#region lib/routes/pubscholar/explore.ts
const route = {
	path: "/explore/:category?/:keyword?",
	name: "Explore",
	maintainers: ["TonyRL"],
	example: "/pubscholar/explore",
	parameters: {
		category: "Category, see the table below, `articles` by default",
		keyword: "Search Keyword"
	},
	handler,
	description: `| Articles / 论文 | Patents / 专利 | Reports / 领域快报 | Information / 动态快讯 | Datasets / 科学数据 | Books / 图书 |
| --------------- | -------------- | ------------------ | ---------------------- | ------------------- | ------------ |
| articles        | patents        | bulletins          | reports                | sciencedata         | books        |`
};
async function handler(ctx) {
	const { category = "articles", keyword } = ctx.req.param();
	const uuid = uuidv4();
	const list = (await rofetch(`${baseUrl}/hky/open/resources/api/v1/${category}`, {
		method: "POST",
		headers: {
			...getSignedHeaders(),
			Cookie: `XSRF-TOKEN=${uuid}`,
			"X-XSRF-TOKEN": uuid
		},
		body: {
			page: 1,
			size: 10,
			order_field: "date",
			order_direction: "desc",
			user_id: md5(Date.now().toString()),
			lang: "zh",
			query: keyword,
			strategy: null,
			orderField: "default"
		}
	})).content.map((item) => ({
		title: (item.is_free || item.links.some((l) => l.is_open_access) ? "「Open Access」" : "") + sanitizeHtml(item.title, {
			allowedTags: [],
			allowedAttributes: {}
		}),
		description: item.abstracts + `<br>${item.links.map((link) => `<a href="${link.url}">${link.is_open_access ? "「Open Access」" : ""}${link.name}</a>`).join("<br>")}`,
		author: item.author.join("; "),
		pubDate: parseDate(item.date),
		category: item.keywords.map((keyword) => sanitizeHtml(keyword, {
			allowedTags: [],
			allowedAttributes: {}
		})),
		link: `${baseUrl}/${category}/${getArticleLink(item.id)}`
	}));
	return {
		title: "PubScholar 公益学术平台",
		link: `${baseUrl}/explore`,
		item: list
	};
}
//#endregion
export { route };
