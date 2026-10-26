import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as md5 } from "./md5-CpIHIxCO.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { randomBytes } from "node:crypto";
//#region lib/routes/gov/zj/czt/utils.ts
const zfcgBaseUrl = "https://zfcg.czt.zj.gov.cn";
const signHeaders = (method, pathWithQuery, body = "") => {
	const timestamp = String(Date.now());
	const nonce = Array.from(randomBytes(16), (b) => "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"[b % 62]).join("");
	return {
		"X-Timestamp": timestamp,
		"X-Nonce": nonce,
		"X-Sign": md5([
			method,
			pathWithQuery,
			body,
			timestamp,
			nonce,
			"zcy@148946"
		].join("\n")),
		"X-Sign-Version": "v1"
	};
};
const flatten = (nodes, parentName) => nodes.flatMap((node) => [{
	id: node.id,
	name: parentName ? `${parentName} - ${node.name}` : node.name,
	code: node.code
}, ...node.children?.length ? flatten(node.children, node.name) : []]);
const getCategories = () => cache_default.tryGet("zfcg:category", async () => {
	const path = `/admin/category/home/categoryTreeFind?parentId=600007&siteId=110&timestamp=${Math.floor(Date.now() / 1e3)}`;
	const { result } = await rofetch(`${zfcgBaseUrl}${path}`, { headers: signHeaders("GET", path) });
	return flatten(result.data);
});
//#endregion
export { signHeaders as n, zfcgBaseUrl as r, getCategories as t };
