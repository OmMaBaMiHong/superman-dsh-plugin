import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as md5 } from "./md5-CpIHIxCO.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
import CryptoJS from "crypto-js";
//#region lib/routes/bilibili/templates/description.tsx
const Description = ({ embed, ugc, ogv, aid, cid, bvid, seasonId, episodeId, img, description }) => /* @__PURE__ */ jsxs(Fragment, { children: [
	embed ? /* @__PURE__ */ jsxs(Fragment, { children: [
		ugc ? /* @__PURE__ */ jsx("iframe", {
			width: "640",
			height: "360",
			src: `https://www.bilibili.com/blackboard/html5mobileplayer.html?aid=${aid}&cid=${cid}&bvid=${bvid}`,
			frameborder: "0",
			allowfullscreen: true
		}) : null,
		ogv ? /* @__PURE__ */ jsx("iframe", {
			width: "640",
			height: "360",
			src: `https://www.bilibili.com/blackboard/html5mobileplayer.html?seasonId=${seasonId}&episodeId=${episodeId}`,
			frameborder: "0",
			allowfullscreen: true
		}) : null,
		/* @__PURE__ */ jsx("br", {})
	] }) : null,
	img ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", { src: img }), /* @__PURE__ */ jsx("br", {})] }) : null,
	description ? raw(description) : null
] });
const renderDescription = (props) => renderToString(/* @__PURE__ */ jsx(Description, { ...props }));
//#endregion
//#region lib/routes/bilibili/utils.ts
function randomHexStr(length) {
	let string = "";
	for (let r = 0; r < length; r++) string += dec2HexUpper(16 * Math.random());
	return padStringWithZeros(string, length);
}
function dec2HexUpper(e) {
	return Math.ceil(e).toString(16).toUpperCase();
}
function padStringWithZeros(string, length) {
	let padding = "";
	if (string.length < length) for (let n = 0; n < length - string.length; n++) padding += "0";
	return padding + string;
}
function lsid() {
	const e = Date.now().toString(16).toUpperCase();
	return randomHexStr(8) + "_" + e;
}
function _uuid() {
	const e = randomHexStr(8);
	const t = randomHexStr(4);
	const r = randomHexStr(4);
	const n = randomHexStr(4);
	const o = randomHexStr(12);
	const i = Date.now();
	return e + "-" + t + "-" + r + "-" + n + "-" + o + padStringWithZeros((i % 1e5).toString(), 5) + "infoc";
}
function shiftCharByOne(string) {
	let shiftedStr = "";
	for (let n = 0; n < string.length; n++) shiftedStr += String.fromCharCode(string.charCodeAt(n) - 1);
	return shiftedStr;
}
function hexsign(e) {
	const r = CryptoJS.HmacSHA256("ts".concat(e), shiftCharByOne("YhxToH[2q"));
	return CryptoJS.enc.Hex.stringify(r);
}
function addRenderData(params, renderData) {
	return `${params}&w_webid=${encodeURIComponent(renderData)}`;
}
function addWbiVerifyInfo(params, wbiVerifyString) {
	const searchParams = new URLSearchParams(params);
	searchParams.sort();
	const verifyParam = searchParams.toString();
	const wts = Math.round(Date.now() / 1e3);
	return `${params}&w_rid=${md5(`${verifyParam}&wts=${wts}${wbiVerifyString}`)}&wts=${wts}`;
}
function generateGaussianInteger(mean, std) {
	const _2PI = Math.PI * 2;
	const u1 = Math.random();
	const u2 = Math.random();
	const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(_2PI * u2);
	return Math.round(z0 * std + mean);
}
function getDmImgList() {
	if (config.bilibili.dmImgList !== void 0) {
		const dmImgList = JSON.parse(config.bilibili.dmImgList);
		return JSON.stringify([dmImgList[Math.floor(Math.random() * dmImgList.length)]]);
	}
	const x = Math.max(generateGaussianInteger(1245, 5), 0);
	const y = Math.max(generateGaussianInteger(1285, 5), 0);
	const path = [{
		x: 3 * x + 2 * y,
		y: 4 * x - 5 * y,
		z: 0,
		timestamp: Math.max(generateGaussianInteger(30, 5), 0),
		type: 0
	}];
	return JSON.stringify(path);
}
function getDmImgInter() {
	if (config.bilibili.dmImgInter !== void 0) {
		const dmImgInter = JSON.parse(config.bilibili.dmImgInter);
		return JSON.stringify([dmImgInter[Math.floor(Math.random() * dmImgInter.length)]]);
	}
	const p1 = getDmImgInterWh(274, 601);
	const s1 = getDmImgInterOf(134, 30);
	const p2 = getDmImgInterWh(332, 64);
	const s2 = getDmImgInterOf(1101, 338);
	const of = getDmImgInterOf(0, 0);
	const wh = getDmImgInterWh(1245, 1285);
	const ds = [{
		t: getDmImgInterT("div"),
		c: getDmImgInterC("clearfix g-search search-container"),
		p: [
			p1[0],
			p1[2],
			p1[1]
		],
		s: [
			s1[2],
			s1[0],
			s1[1]
		]
	}, {
		t: getDmImgInterT("div"),
		c: getDmImgInterC("wrapper"),
		p: [
			p2[0],
			p2[2],
			p2[1]
		],
		s: [
			s2[2],
			s2[0],
			s2[1]
		]
	}];
	return JSON.stringify({
		ds,
		wh,
		of
	});
}
function getDmImgInterT(tag) {
	return {
		a: 4,
		article: 29,
		button: 7,
		div: 2,
		em: 27,
		form: 17,
		h1: 11,
		h2: 12,
		h3: 13,
		h4: 14,
		h5: 15,
		h6: 16,
		img: 5,
		input: 6,
		label: 25,
		li: 10,
		ol: 9,
		option: 20,
		p: 3,
		section: 28,
		select: 19,
		span: 1,
		strong: 26,
		table: 21,
		td: 23,
		textarea: 18,
		th: 24,
		tr: 22,
		ul: 8
	}[tag];
}
function getDmImgInterC(className) {
	return Buffer.from(className).toString("base64").slice(0, -2);
}
function getDmImgInterOf(top, left) {
	const seed = Math.floor(514 * Math.random());
	return [
		3 * top + 2 * left + seed,
		4 * top - 4 * left + 2 * seed,
		seed
	];
}
function getDmImgInterWh(width, height) {
	const seed = Math.floor(114 * Math.random());
	return [
		2 * width + 2 * height + 3 * seed,
		4 * width - height + seed,
		seed
	];
}
function addDmVerifyInfo(params, dmImgList) {
	return `${params}&dm_img_list=${dmImgList}&dm_img_str=${Buffer.from("no webgl").toString("base64").slice(0, -2)}&dm_cover_img_str=${Buffer.from("no webgl").toString("base64").slice(0, -2)}`;
}
function addDmVerifyInfoWithInter(params, dmImgList, dmImgInter) {
	return `${addDmVerifyInfo(params, dmImgList)}&dm_img_inter=${dmImgInter}`;
}
const bvidTime = 1589990400;
/**
* 获取番剧信息并缓存
*
* @param {string} id - 番剧 ID。
* @param cache - 缓存 module。
* @returns {Promise<MediaResult>} 番剧信息。
*/
const getBangumi = (id, cache) => cache.tryGet(`bilibili:getBangumi:${id}`, async () => {
	const res = await rofetch("https://api.bilibili.com/pgc/view/web/media", { query: { media_id: id } });
	if (res.result.share_url === void 0) res.result.share_url = `https://www.bilibili.com/bangumi/media/md${res.result.media_id}`;
	return res.result;
}, config.cache.routeExpire, false);
/**
* 获取番剧分集信息并缓存
*
* @param {string} id - 番剧 ID。
* @param cache - 缓存 module。
* @returns {Promise<SeasonResult>} 番剧分集信息。
*/
const getBangumiItems = (id, cache) => cache.tryGet(`bilibili:getBangumiItems:${id}`, async () => {
	return (await rofetch("https://api.bilibili.com/pgc/web/season/section", { query: { season_id: id } })).result;
}, config.cache.routeExpire, false);
/**
* Render the UGC (user-generated content) description.
*
* @param {boolean} embed - Whether to embed the video.
* @param {string} img - Image URL to include in the description.
* @param {string} description - UGC text description.
* @param {string} [aid] - Optional UGC aid.
* @param {string} [cid] - Optional UGC cid.
* @param {string} [bvid] - Optional UGC bvid.
* @returns {string} Rendered UGC description.
*
* @see https://player.bilibili.com/ for details.
*/
const renderUGCDescription = (embed, img, description, aid, cid, bvid) => {
	return renderDescription({
		embed,
		ugc: true,
		aid,
		cid,
		bvid,
		img: img.replace("http://", "https://"),
		description
	});
};
/**
* Render the OGV (original video) description.
*
* @param {boolean} embed - Whether to embed the video.
* @param {string} img - Image URL to include in the description.
* @param {string} description - OGV text description.
* @param {string} [seasonId] - Optional OGV season ID.
* @param {string} [episodeId] - Optional OGV episode ID.
* @returns {string} Rendered OGV description.
*
* @see https://player.bilibili.com/ for details.
*/
const renderOGVDescription = (embed, img, description, seasonId, episodeId) => {
	return renderDescription({
		embed,
		ogv: true,
		seasonId,
		episodeId,
		img: img.replace("http://", "https://"),
		description
	});
};
function getVideoUrl(bvid) {
	return bvid ? `https://www.bilibili.com/blackboard/newplayer.html?isOutside=true&autoplay=true&danmaku=true&muted=false&highQuality=true&bvid=${bvid}` : void 0;
}
const getLiveUrl = (roomId) => roomId ? `https://www.bilibili.com/blackboard/live/live-activity-player.html?cid=${roomId}` : void 0;
var utils_default = {
	lsid,
	_uuid,
	hexsign,
	addWbiVerifyInfo,
	getDmImgList,
	getDmImgInter,
	addDmVerifyInfo,
	addDmVerifyInfoWithInter,
	bvidTime,
	addRenderData,
	getBangumi,
	getBangumiItems,
	renderUGCDescription,
	renderOGVDescription,
	getVideoUrl
};
//#endregion
export { getVideoUrl as n, utils_default as r, getLiveUrl as t };
