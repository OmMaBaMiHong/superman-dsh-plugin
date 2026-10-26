import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as md5 } from "./md5-CpIHIxCO.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import CryptoJS from "crypto-js";
//#region lib/routes/18comic/templates/description.tsx
const renderDescription = ({ cover, category = [], introduction, images = [] }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	cover ? /* @__PURE__ */ jsx("img", { src: cover }) : null,
	/* @__PURE__ */ jsx("p", { children: category.map((item) => /* @__PURE__ */ jsx("code", { children: item })) }),
	/* @__PURE__ */ jsx("p", { children: introduction }),
	images.map((image) => /* @__PURE__ */ jsx("img", { src: image }))
] }));
//#endregion
//#region lib/routes/18comic/utils.ts
const defaultDomain = "jmcomic1.me";
const allowDomain = /* @__PURE__ */ new Set([
	"18comic.vip",
	"18comic.org",
	"jmcomic.me",
	"jmcomic1.me",
	"jm-comic3.art",
	"jm-comic.club",
	"jm-comic2.ark"
]);
const apiDomain = "www.cdnhth.cc";
const getRootUrl = (domain) => {
	if (!config.feature.allow_user_supply_unsafe_domain && !allowDomain.has(domain)) throw new ConfigNotFoundError(`This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`);
	return `https://${domain}`;
};
const apiMapCategory = (category) => {
	switch (category) {
		case "another": return "其他漫畫";
		case "doujin": return "同人";
		case "hanman": return "韓漫";
		case "meiman": return "美漫";
		case "short": return "短篇";
		case "single": return "單本";
		default: return null;
	}
};
const getApiUrl = () => `https://${apiDomain}`;
const processApiItems = async (apiUrl) => {
	apiUrl = apiUrl.replace(/\?$/, "");
	const ts = Date.now();
	const tokenParam = `${ts},1.7.5`;
	let token = `${ts}18comicAPP`;
	token = md5(token);
	const response = await got_default(apiUrl, { headers: {
		token,
		tokenparam: tokenParam
	} });
	const encryptedWordArray = CryptoJS.enc.Base64.parse(response.data.data);
	const md5HexStr = CryptoJS.MD5(ts + "185Hcomic3PAPP7R").toString();
	const key = CryptoJS.enc.Utf8.parse(md5HexStr);
	const cipherParams = CryptoJS.lib.CipherParams.create({ ciphertext: encryptedWordArray });
	const resultJson = CryptoJS.AES.decrypt(cipherParams, key, {
		mode: CryptoJS.mode.ECB,
		padding: CryptoJS.pad.Pkcs7
	}).toString(CryptoJS.enc.Utf8);
	return JSON.parse(resultJson);
};
const ProcessItems = async (ctx, currentUrl, rootUrl) => {
	currentUrl = currentUrl.replace(/\?$/, "");
	const $ = load((await got_default(currentUrl)).data);
	let items = $(".video-title").slice(0, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 20).toArray().map((item) => {
		item = $(item);
		return {
			title: item.text().trim(),
			link: `${rootUrl}${item.prev().find("a").attr("href")}`,
			guid: `18comic:${item.prev().find("a").attr("href")}`
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.guid, async () => {
		const content = load((await got_default(item.link)).data);
		item.pubDate = parseDate(content("div[itemprop=\"datePublished\"]").first().attr("content"));
		item.updated = parseDate(content("div[itemprop=\"datePublished\"]").last().attr("content"));
		item.category = content("span[data-type=\"tags\"]").first().find("a").toArray().map((c) => $(c).text());
		item.author = content("span[data-type=\"author\"]").first().find("a").toArray().map((a) => $(a).text()).join(", ");
		item.description = renderDescription({
			introduction: content("#intro-block .p-t-5").text(),
			images: content(".img_zoom_img img").toArray().map((image) => content(image).attr("data-original")),
			cover: content(".thumb-overlay img").first().attr("src"),
			category: item.category
		});
		return item;
	})));
	return {
		title: $("title").text(),
		link: currentUrl,
		item: items,
		description: $("meta[property=\"og:description\"]").attr("content"),
		allowEmpty: true
	};
};
//#endregion
export { getRootUrl as a, getApiUrl as i, apiMapCategory as n, processApiItems as o, defaultDomain as r, renderDescription as s, ProcessItems as t };
