import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import * as cheerio from "cheerio";
import CryptoJS from "crypto-js";
//#region lib/routes/zaker/utils.ts
const hints = [
	"globalThis",
	"headless",
	"languages",
	"permHook",
	"vendor",
	"webDriverValue",
	"webdriver"
];
const baseUrl = "https://www.myzaker.com";
const generateSalt = (input, targetZeros = 20) => {
	for (let nonce = 0; nonce < 1e8; nonce++) {
		const hash = CryptoJS.SHA256(input + nonce).toString();
		let leadingZeros = 0;
		for (const char of hash) {
			if (char !== "0") {
				leadingZeros += 4 - Number.parseInt(char, 16).toString(2).length;
				break;
			}
			leadingZeros += 4;
		}
		if (leadingZeros >= targetZeros) return nonce;
	}
	return 0;
};
const padSeed = (seed) => {
	const padding = "0".repeat(16);
	return CryptoJS.enc.Utf8.parse((seed + padding).slice(0, 16));
};
const encrypt = (data, seed) => {
	const iv = CryptoJS.enc.Utf8.parse("1234567890123456");
	return CryptoJS.AES.encrypt(JSON.stringify(data), padSeed(seed), {
		iv,
		padding: CryptoJS.pad.Pkcs7
	});
};
const encryptPayload = (data, seed) => encrypt(data, seed).ciphertext.toString();
const getSafeLineCookieWithData = async (link) => {
	const cacheKey = "zaker:cookie";
	const cacheAge = 3600;
	const cacheIn = await cache_default.get(cacheKey, false);
	if (cacheIn) return JSON.parse(cacheIn);
	const apiBaseUrl = "https://challenge.rivers.chaitin.cn/captcha/api";
	const headerResponse = await rofetch.raw(link);
	const session = headerResponse.headers.getSetCookie().find((e) => e.startsWith("sl-session"))?.split(";", 1)[0].split("sl-session=", 2)[1];
	const onceId = headerResponse._data.match(/once_id:\s*"(.*?)",/)?.[1];
	logger.debug(`getSafeLineCookie: sl-session=${session}, onceId=${onceId}`);
	if (!/window\.captcha/.test(headerResponse._data)) {
		logger.debug("getSafeLineCookie: Failed to get once_id");
		return {
			cookie: headerResponse.headers.getSetCookie().map((c) => c.split(";", 1)[0]).join("; "),
			data: headerResponse._data
		};
	}
	const seedResponse = await rofetch(`${apiBaseUrl}/seed`, {
		headers: { Referer: `${baseUrl}/` },
		query: {
			once_id: onceId,
			v: "1.0.0",
			hints: hints.toSorted(() => Math.random() - .5).join(",")
		}
	});
	const ua = config.ua;
	const seed = seedResponse.seed;
	const takeTime = Math.trunc(Math.random() * 2e3 + 1e3);
	logger.debug(`getSafeLineCookie: ua=${ua}, seed=${seed}, takeTime=${takeTime}`);
	const payload = encryptPayload({
		resolution: "1920x1080",
		languages: ["en-US"],
		useragents: [
			ua,
			ua,
			ua
		],
		hint: 0,
		salt: String(generateSalt(seed, 16)),
		taketime: takeTime
	}, seed);
	const inspectResponse = await rofetch(`${apiBaseUrl}/inspect`, {
		method: "POST",
		headers: {
			Referer: `${baseUrl}/`,
			"Content-Type": "text/plain"
		},
		query: { seed },
		body: payload
	});
	logger.debug(`getSafeLineCookie: inspectResponse=${JSON.stringify(inspectResponse)}`);
	if (inspectResponse.reason) {
		logger.error(`getSafeLineCookie: reason=${inspectResponse.reason}`);
		return {
			cookie: headerResponse.headers.getSetCookie().map((c) => c.split(";", 1)[0]).join("; "),
			data: headerResponse._data
		};
	}
	const response = await rofetch.raw(link, { headers: { Cookie: `sl-session=${session}; sl_waf_recap=${inspectResponse.jwt}` } });
	const cookie = response.headers.getSetCookie().map((c) => c.split(";", 1)[0]).join("; ");
	logger.debug(`getSafeLineCookie: ${cookie}`);
	cache_default.set(cacheKey, JSON.stringify(cookie), cacheAge);
	return {
		cookie,
		data: response._data
	};
};
const parseList = ($) => {
	return JSON.parse($("script:contains(\"window.WinPageData\")").text().match(/window\.WinPageData\s*=\s*(\{.*\})/)?.[1] ?? "{}").data.article.map((item) => ({
		title: item.title,
		description: item.desc,
		link: "https:" + item.url,
		author: item.author_name,
		pubDate: timezone(parseDate(item.date, "MM月DD日"), 8),
		category: item.tag.map((t) => t.tag),
		image: item.thumbnail_mpic
	}));
};
const fetchItem = async (item, cookie) => {
	const response = await rofetch(item.link, { headers: { Cookie: cookie } });
	const $ = cheerio.load(response);
	const content = $("div.article_content div");
	content.find("img").each((_, img) => {
		const $img = $(img);
		$img.attr("src", $img.attr("data-original"));
		$img.removeAttr("data-original");
	});
	item.description = content.html();
	return item;
};
//#endregion
export { parseList as i, fetchItem as n, getSafeLineCookieWithData as r, baseUrl as t };
