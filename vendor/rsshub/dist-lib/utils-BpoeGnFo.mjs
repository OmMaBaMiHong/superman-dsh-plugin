import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as md5 } from "./md5-CpIHIxCO.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/zhihu/execlib/x-zse-96-v3.ts
function i(e, t, n) {
	t[n] = 255 & e >>> 24, t[n + 1] = 255 & e >>> 16, t[n + 2] = 255 & e >>> 8, t[n + 3] = 255 & e;
}
function B(e, t) {
	return (255 & e[t]) << 24 | (255 & e[t + 1]) << 16 | (255 & e[t + 2]) << 8 | 255 & e[t + 3];
}
function Q(e, t) {
	return (4294967295 & e) << t | e >>> 32 - t;
}
function G(e) {
	const t = Array.from({ length: 4 });
	const n = Array.from({ length: 4 });
	i(e, t, 0), n[0] = h.zb[255 & t[0]], n[1] = h.zb[255 & t[1]], n[2] = h.zb[255 & t[2]], n[3] = h.zb[255 & t[3]];
	const r = B(n, 0);
	return r ^ Q(r, 2) ^ Q(r, 10) ^ Q(r, 18) ^ Q(r, 24);
}
const __g = {
	x(e, t) {
		let n = [];
		for (let r = e.length, i = 0; 0 < r; r -= 16) {
			const a = Array.from({ length: 16 });
			for (let o = e.slice(16 * i, 16 * (i + 1)), c = 0; c < 16; c++) a[c] = o[c] ^ t[c];
			t = __g.r(a), n = n.concat(t), i++;
		}
		return n;
	},
	r(e) {
		const t = Array.from({ length: 16 });
		const n = Array.from({ length: 36 });
		n[0] = B(e, 0), n[1] = B(e, 4), n[2] = B(e, 8), n[3] = B(e, 12);
		for (let r = 0; r < 32; r++) {
			const o = G(n[r + 1] ^ n[r + 2] ^ n[r + 3] ^ h.zk[r]);
			n[r + 4] = n[r] ^ o;
		}
		return i(n[35], t, 0), i(n[34], t, 4), i(n[33], t, 8), i(n[32], t, 12), t;
	}
};
const h = {
	zk: [
		1170614578,
		1024848638,
		1413669199,
		-343334464,
		-766094290,
		-1373058082,
		-143119608,
		-297228157,
		1933479194,
		-971186181,
		-406453910,
		460404854,
		-547427574,
		-1891326262,
		-1679095901,
		2119585428,
		-2029270069,
		2035090028,
		-1521520070,
		-5587175,
		-77751101,
		-2094365853,
		-1243052806,
		1579901135,
		1321810770,
		456816404,
		-1391643889,
		-229302305,
		330002838,
		-788960546,
		363569021,
		-1947871109
	],
	zb: [
		20,
		223,
		245,
		7,
		248,
		2,
		194,
		209,
		87,
		6,
		227,
		253,
		240,
		128,
		222,
		91,
		237,
		9,
		125,
		157,
		230,
		93,
		252,
		205,
		90,
		79,
		144,
		199,
		159,
		197,
		186,
		167,
		39,
		37,
		156,
		198,
		38,
		42,
		43,
		168,
		217,
		153,
		15,
		103,
		80,
		189,
		71,
		191,
		97,
		84,
		247,
		95,
		36,
		69,
		14,
		35,
		12,
		171,
		28,
		114,
		178,
		148,
		86,
		182,
		32,
		83,
		158,
		109,
		22,
		255,
		94,
		238,
		151,
		85,
		77,
		124,
		254,
		18,
		4,
		26,
		123,
		176,
		232,
		193,
		131,
		172,
		143,
		142,
		150,
		30,
		10,
		146,
		162,
		62,
		224,
		218,
		196,
		229,
		1,
		192,
		213,
		27,
		110,
		56,
		231,
		180,
		138,
		107,
		242,
		187,
		54,
		120,
		19,
		44,
		117,
		228,
		215,
		203,
		53,
		239,
		251,
		127,
		81,
		11,
		133,
		96,
		204,
		132,
		41,
		115,
		73,
		55,
		249,
		147,
		102,
		48,
		122,
		145,
		106,
		118,
		74,
		190,
		29,
		16,
		174,
		5,
		177,
		129,
		63,
		113,
		99,
		31,
		161,
		76,
		246,
		34,
		211,
		13,
		60,
		68,
		207,
		160,
		65,
		111,
		82,
		165,
		67,
		169,
		225,
		57,
		112,
		244,
		155,
		51,
		236,
		200,
		233,
		58,
		61,
		47,
		100,
		137,
		185,
		64,
		17,
		70,
		234,
		163,
		219,
		108,
		170,
		166,
		59,
		149,
		52,
		105,
		24,
		212,
		78,
		173,
		45,
		0,
		116,
		226,
		119,
		136,
		206,
		135,
		175,
		195,
		25,
		92,
		121,
		208,
		126,
		139,
		3,
		75,
		141,
		21,
		130,
		98,
		241,
		40,
		154,
		66,
		184,
		49,
		181,
		46,
		243,
		88,
		101,
		183,
		8,
		23,
		72,
		188,
		104,
		179,
		210,
		134,
		250,
		201,
		164,
		89,
		216,
		202,
		220,
		50,
		221,
		152,
		140,
		33,
		235,
		214
	]
};
const encode = (param) => {
	const salt = "6fpLRqJO8M/c3jnYxFkUVC4ZIG12SiH=5v0mXDazWBTsuw7QetbKdoPyAl+hN9rgE";
	let result = "";
	for (const x of [
		0,
		6,
		12,
		18
	]) {
		const b = param >>> x & 63;
		const c = salt.charAt(b);
		result += c;
	}
	return result;
};
const preProcess = (md5Str) => {
	const md5CharCodeAtArr = [];
	for (let i = 0; i < md5Str.length; i++) md5CharCodeAtArr.push(md5Str.charCodeAt(i));
	md5CharCodeAtArr.unshift(0);
	md5CharCodeAtArr.unshift(Math.random() * 127);
	for (let i = 0; i < 15; i++) md5CharCodeAtArr.push(14);
	const md5CharCodeAtFrontArr = md5CharCodeAtArr.slice(0, 16);
	const fixArr = [
		48,
		53,
		57,
		48,
		53,
		51,
		102,
		55,
		100,
		49,
		53,
		101,
		48,
		49,
		100,
		55
	];
	const new_md5_charCodeAt_arr = [];
	for (const [i, element] of md5CharCodeAtFrontArr.entries()) new_md5_charCodeAt_arr.push(element ^ fixArr[i] ^ 42);
	const __g_r = __g.r(new_md5_charCodeAt_arr);
	const md5CharCodeAtBackArr = md5CharCodeAtArr.slice(16, 48);
	const __g_x = __g.x(md5CharCodeAtBackArr, __g_r);
	return __g_r.concat(__g_x);
};
const encrypt = (md5Str) => {
	const processed = preProcess(md5Str);
	let current = 0;
	let resultStr = "";
	for (let i = 0; i < processed.length; i++) {
		const pop = processed[processed.length - i - 1];
		const i_mod_4 = i % 4;
		const i_mod_3 = i % 3;
		const e = (pop ^ 58 >>> 8 * i_mod_4 & 255) << 8 * i_mod_3;
		current |= e;
		if (i_mod_3 === 2) {
			resultStr += encode(current);
			current = 0;
		}
	}
	return resultStr;
};
//#endregion
//#region lib/routes/zhihu/utils.ts
const header = { "x-api-version": "3.0.91" };
const fixImageUrl = (url) => url.split("?", 1)[0].replace("_b.jpg", ".jpg").replace("_r.jpg", ".jpg").replace("_720w.jpg", ".jpg");
const processImage = (content) => {
	const $ = load(content, null, false);
	$("noscript, a[data-draft-type=\"mcn-link-card\"]").remove();
	$("a").each((_, elem) => {
		const href = $(elem).attr("href");
		if (href?.startsWith("http://link.zhihu.com/?target=") || href?.startsWith("https://link.zhihu.com/?target=")) {
			const target = new URL(href).searchParams.get("target") || "";
			try {
				$(elem).attr("href", decodeURIComponent(target));
			} catch {}
		}
	});
	$("img.content_image, img.origin_image, img.content-image, img.data-actualsrc, figure>img").each((i, e) => {
		if (e.attribs["data-actualsrc"]) {
			$(e).attr({
				src: fixImageUrl(e.attribs["data-actualsrc"]),
				width: null,
				height: null
			});
			$(e).removeAttr("data-actualsrc");
		} else if (e.attribs["data-original"]) {
			$(e).attr({
				src: fixImageUrl(e.attribs["data-original"]),
				width: null,
				height: null
			});
			$(e).removeAttr("data-original");
		} else $(e).attr({
			src: fixImageUrl(e.attribs.src),
			width: null,
			height: null
		});
	});
	return $.html();
};
const getCookieValueByKey = (key) => config.zhihu.cookies?.split(";").map((e) => e.trim()).find((e) => e.startsWith(key + "="))?.slice(key.length + 1) || "";
const getSignedHeader = async (url, apiPath) => {
	if (config?.zhihu?.cookies) {
		const dc0 = getCookieValueByKey("d_c0");
		const xzse93 = "101_3_3.0";
		const xzse96 = "2.0_" + encrypt(md5(`${xzse93}+${apiPath}+${dc0}`));
		let cookieStr = config.zhihu.cookies;
		if (!getCookieValueByKey("__zse_ck")) {
			const zseCk = await cache_default.tryGet("zhihu:zse_ck", async () => {
				return (await (await rofetch.raw("https://static.zhihu.com/zse-ck/v3.js"))._data.text()).match(/__g\.ck\|\|"([\w+/=\\]*)",_=/)?.[1] || "";
			});
			if (zseCk) cookieStr += `; __zse_ck=${zseCk}`;
		}
		return {
			cookie: cookieStr,
			"x-zse-96": xzse96,
			"x-app-za": "OS=Web",
			"x-zse-93": xzse93
		};
	}
	const { dc0, zseCk } = await cache_default.tryGet("zhihu:cookies:d_c0", async () => {
		if (getCookieValueByKey("d_c0") && getCookieValueByKey("__zse_ck")) return {
			dc0: getCookieValueByKey("d_c0"),
			zseCk: getCookieValueByKey("__zse_ck")
		};
		const response1 = await rofetch.raw("https://static.zhihu.com/zse-ck/v3.js");
		const zseCk = (await response1._data.text()).match(/__g\.ck\|\|"([\w+/=\\]*)",_=/)?.[1];
		return {
			dc0: ((zseCk ? await rofetch.raw(url, { headers: { cookie: `${response1.headers.getSetCookie().map((s) => s.split(";", 1)[0]).join("; ")}; __zse_ck=${zseCk}` } }) : null) || response1).headers.getSetCookie().find((s) => s.startsWith("d_c0="))?.split(";", 1)[0].trim().slice(5) || "",
			zseCk
		};
	});
	const xzse93 = "101_3_3.0";
	const xzse96 = "2.0_" + encrypt(md5(`${xzse93}+${apiPath}+${dc0}`));
	const zc0 = getCookieValueByKey("z_c0");
	return {
		cookie: `__zse_ck=${zseCk}; d_c0=${dc0}${zc0 ? `;z_c0=${zc0}` : ""}`,
		"x-zse-96": xzse96,
		"x-app-za": "OS=Web",
		"x-zse-93": xzse93
	};
};
//#endregion
export { header as n, processImage as r, getSignedHeader as t };
