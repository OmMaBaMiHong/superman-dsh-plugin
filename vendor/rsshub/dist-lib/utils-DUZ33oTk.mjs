import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as md5 } from "./md5-CpIHIxCO.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import crypto from "node:crypto";
import { load } from "cheerio";
//#region lib/routes/coolapk/utils.ts
const dynamicTpye = {
	0: "基本动态",
	8: "酷图",
	9: "评论",
	10: "提问",
	11: "回答",
	12: "图文",
	15: "二手",
	17: "观点",
	20: "交易动态"
};
const getRandomDEVICE_ID = () => crypto.randomUUID();
const get_app_token = () => {
	const DEVICE_ID = getRandomDEVICE_ID();
	const now = Math.round(Date.now() / 1e3);
	const hex_now = "0x" + now.toString(16);
	const s = "token://com.coolapk.market/c67ef5943784d09750dcfbb31020f0ab?" + md5(now.toString()) + "$" + DEVICE_ID + "&com.coolapk.market";
	return md5(Buffer.from(s).toString("base64")) + DEVICE_ID + hex_now;
};
const base_url = "https://api.coolapk.com";
const v2_api_url = "https://api2.coolapk.com";
const getHeaders = () => ({
	"X-Requested-With": "XMLHttpRequest",
	"X-App-Id": "com.coolapk.market",
	"X-App-Token": get_app_token(),
	"X-Sdk-Int": "29",
	"X-Sdk-Locale": "zh-CN",
	"X-App-Version": "11.0",
	"X-Api-Version": "11",
	"X-App-Code": "2101202",
	"User-Agent": "Dalvik/2.1.0 (Linux; U; Android 10; Redmi K30 5G MIUI/V12.0.3.0.QGICMXM) (#Build; Redmi; Redmi K30 5G; QKQ1.191222.002 test-keys; 10) +CoolMarket/11.0-2101202"
});
const parseTuwenFromRaw = (raw) => raw.map((i) => {
	switch (i.type) {
		case "text": return i.message.split("\n").filter((t) => t !== "").map((t) => `<p>${t}</p>`).join("");
		case "image": return `<div class="img-container" style="text-align: center;">
                <img src="${i.url}">
                <p class="image-caption" style="text-align: center;">${i.description}</p></div>`;
		case "shareUrl": return `<a href="${i.url}" target="_blank" rel="noopener">${i.title}</a>`;
		default:
			logger.debug(`Unknown tuwen type: ${i.type}`);
			return "Unknown type";
	}
});
const parseDynamic = async (item) => {
	const pubDate = parseDate(item.dateline, "X");
	if (item.entityType === "sponsorCard" || !item.url) return;
	const itemUrl = `${v2_api_url}/v6${item.url.replace("/feed/", "/feed/detail?id=")}`;
	let description, title;
	const type = Number.parseInt(item.type);
	switch (type) {
		case 0:
		case 5:
		case 7:
		case 8:
		case 9:
		case 10:
		case 11:
		case 13:
		case 15:
		case 17:
		case 20:
			if (item.issummary) description = await cache_default.tryGet(itemUrl, async () => {
				return "<p>" + (await rofetch(itemUrl, { headers: getHeaders() })).data?.message.split("\n").join("<br>") + "</p>" + item.picArr.filter(Boolean).map((i) => `<img src="${i}">`).join("");
			});
			else {
				const picArr = item.picArr.filter(Boolean).map((i) => `<img src="${i}">`);
				description = "<p>" + item.message + "</p>" + picArr.join("");
			}
			title = load("<div class=\"title-filter\">" + description + "</div>")(".title-filter").text().trim();
			if (type === 17) {
				const keys = item.extra_key.split(",");
				description += "<p>" + item.vote.message_title + ` 已选${keys.length}项</p>`;
				for (const i of item.vote.options) if (keys.includes(String(i.id))) description += `<p>${i.title}√</p>`;
			} else if (type === 10 || type === 11) title = `${item.message_title} 更多:` + title;
			break;
		case 12:
			title = item.title;
			description = await cache_default.tryGet(itemUrl, async () => {
				const result = await rofetch(itemUrl, { headers: getHeaders() });
				if (!result.data) return result.message;
				const raw = JSON.parse(result.data.message_raw_output);
				const tags = parseTuwenFromRaw(raw);
				return `<img src="${result.data.pic}"><hr>` + tags.join("");
			});
			break;
		default: break;
	}
	return {
		title,
		description,
		pubDate,
		link: `https://www.coolapk.com${item.url}`,
		author: item.username
	};
};
var utils_default = {
	get_app_token,
	base_url,
	getHeaders,
	parseDynamic,
	dynamicTpye
};
//#endregion
export { utils_default as t };
