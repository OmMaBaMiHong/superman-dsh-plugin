import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import crypto from "node:crypto";
import sanitizeHtml from "sanitize-html";
//#region lib/routes/ximalaya/utils.ts
const getRandom16 = (len) => crypto.randomBytes(Math.ceil(len / 2)).toString("hex").slice(0, len);
const decryptUrl = (encryptedUrl) => {
	const o = [
		183,
		174,
		108,
		16,
		131,
		159,
		250,
		5,
		239,
		110,
		193,
		202,
		153,
		137,
		251,
		176,
		119,
		150,
		47,
		204,
		97,
		237,
		1,
		71,
		177,
		42,
		88,
		218,
		166,
		82,
		87,
		94,
		14,
		195,
		69,
		127,
		215,
		240,
		225,
		197,
		238,
		142,
		123,
		44,
		219,
		50,
		190,
		29,
		181,
		186,
		169,
		98,
		139,
		185,
		152,
		13,
		141,
		76,
		6,
		157,
		200,
		132,
		182,
		49,
		20,
		116,
		136,
		43,
		155,
		194,
		101,
		231,
		162,
		242,
		151,
		213,
		53,
		60,
		26,
		134,
		211,
		56,
		28,
		223,
		107,
		161,
		199,
		15,
		229,
		61,
		96,
		41,
		66,
		158,
		254,
		21,
		165,
		253,
		103,
		89,
		3,
		168,
		40,
		246,
		81,
		95,
		58,
		31,
		172,
		78,
		99,
		45,
		148,
		187,
		222,
		124,
		55,
		203,
		235,
		64,
		68,
		149,
		180,
		35,
		113,
		207,
		118,
		111,
		91,
		38,
		247,
		214,
		7,
		212,
		209,
		189,
		241,
		18,
		115,
		173,
		25,
		236,
		121,
		249,
		75,
		57,
		216,
		10,
		175,
		112,
		234,
		164,
		70,
		206,
		198,
		255,
		140,
		230,
		12,
		32,
		83,
		46,
		245,
		0,
		62,
		227,
		72,
		191,
		156,
		138,
		248,
		114,
		220,
		90,
		84,
		170,
		128,
		19,
		24,
		122,
		146,
		80,
		39,
		37,
		8,
		34,
		22,
		11,
		93,
		130,
		63,
		154,
		244,
		160,
		144,
		79,
		23,
		133,
		92,
		54,
		102,
		210,
		65,
		67,
		27,
		196,
		201,
		106,
		143,
		52,
		74,
		100,
		217,
		179,
		48,
		233,
		126,
		117,
		184,
		226,
		85,
		171,
		167,
		86,
		2,
		147,
		17,
		135,
		228,
		252,
		105,
		30,
		192,
		129,
		178,
		120,
		36,
		145,
		51,
		163,
		77,
		205,
		73,
		4,
		188,
		125,
		232,
		33,
		243,
		109,
		224,
		104,
		208,
		221,
		59,
		9
	];
	const a = [
		204,
		53,
		135,
		197,
		39,
		73,
		58,
		160,
		79,
		24,
		12,
		83,
		180,
		250,
		101,
		60,
		206,
		30,
		10,
		227,
		36,
		95,
		161,
		16,
		135,
		150,
		235,
		116,
		242,
		116,
		165,
		171
	];
	const padding = "=".repeat((4 - encryptedUrl.length % 4) % 4);
	const encryptedData = Buffer.from(encryptedUrl.replace("_", "/").replace("-", "+") + padding, "base64");
	if (encryptedData.length < 16) return encryptedUrl;
	const data = encryptedData.subarray(0, -16);
	const iv = encryptedData.subarray(-16);
	const decryptedData = new Uint8Array(data);
	for (let i = 0; i < decryptedData.length; i++) decryptedData[i] = o[decryptedData[i]];
	for (let i = 0; i < decryptedData.length; i += 16) {
		const block = decryptedData.subarray(i, i + 16);
		for (const [j, element] of block.entries()) decryptedData[i + j] = element ^ iv[j];
	}
	for (let i = 0; i < decryptedData.length; i += 32) {
		const block = decryptedData.subarray(i, i + 32);
		for (const [j, element] of block.entries()) decryptedData[i + j] = element ^ a[j];
	}
	return Buffer.from(decryptedData).toString("utf8");
};
//#endregion
//#region lib/routes/ximalaya/album.ts
const baseUrl = "https://www.ximalaya.com";
const categoryDict = {
	人文: "Society & Culture",
	历史: "History",
	头条: "News",
	娱乐: "Leisure",
	音乐: "Music",
	IT科技: "Technology"
};
function getAlbumData(albumId) {
	return cache_default.tryGet(`ximalaya:albumInfo:${albumId}`, async () => {
		return (await rofetch(`${baseUrl}/revision/album/v1/simple`, {
			query: { albumId },
			parseResponse: JSON.parse
		})).data.albumPageMainInfo;
	});
}
function judgeTrue(str, ...validStrings) {
	if (!str) return false;
	str = str.toLowerCase();
	if (str === "true" || str === "1") return true;
	for (const _s of validStrings) if (str === _s) return true;
	return false;
}
const route = {
	path: "/:type/:id/:all/:shownote?",
	categories: ["multimedia"],
	example: "/ximalaya/album/299146",
	parameters: {
		type: "专辑类型, 通常可以使用 `album`，可在对应专辑页面的 URL 中找到",
		id: "专辑 id, 可在对应专辑页面的 URL 中找到",
		all: "是否需要获取全部节目，填入 `1`、`true`、`all` 视为获取所有节目，填入其他则不获取。"
	},
	features: {
		requireConfig: [{
			name: "XIMALAYA_TOKEN",
			description: ""
		}],
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: true,
		supportScihub: false
	},
	name: "专辑",
	maintainers: [
		"lengthmin",
		"jjeejj",
		"prnake"
	],
	handler,
	description: `目前喜马拉雅的 API 只能一集一集的获取各节目上的 ShowNote，会极大的占用系统资源，所以默认为不获取节目的 ShowNote。

::: warning
专辑类型即 url 中的分类拼音，使用通用分类 \`album\` 通常是可行的，专辑 id 是跟在**分类拼音**后的那个 id, 不要输成某集的 id 了

**付费内容需要配置好已购买账户的 token 才能收听，详情见部署页面的配置模块**
:::`
};
async function handler(ctx) {
	const type = ctx.req.param("type");
	const id = ctx.req.param("id");
	const shouldAll = judgeTrue(ctx.req.param("all"), "all");
	const shouldShowNote = judgeTrue(ctx.req.param("shownote"), "shownote");
	const pageSize = shouldAll ? 200 : 30;
	const albumData = await getAlbumData(id);
	const isPaid = albumData.isPaid;
	const author = albumData.anchorName;
	const albumTitle = albumData.albumTitle;
	const albumCover = "https:" + albumData.cover;
	const albumIntro = sanitizeHtml(albumData.detailRichIntro, {
		allowedTags: [],
		allowedAttributes: {}
	});
	const albumCategory = albumData.categoryTitle;
	const trackInfoApi = `https://mobile.ximalaya.com/mobile/v1/album/track/?albumId=${id}&pageSize=${pageSize}&pageId=`;
	const trackInfoResponse = await rofetch(trackInfoApi + "1", { parseResponse: JSON.parse });
	const maxPageId = trackInfoResponse.data.maxPageId;
	let playList = trackInfoResponse.data.list;
	if (shouldAll) {
		const promises = [];
		for (let i = 2; i <= maxPageId; i++) promises.push(rofetch(trackInfoApi + i, { parseResponse: JSON.parse }));
		const responses = await Promise.all(promises);
		for (const j of responses) playList = [...playList, ...j.data.list];
	}
	await Promise.all(playList.map(async (item) => {
		item.desc = await cache_default.tryGet(`ximalaya:trackRichInfo:${item.trackId}:${shouldShowNote.toString()}`, async () => {
			let _desc = "";
			if (shouldShowNote) _desc = (await rofetch(`https://mobile.ximalaya.com/mobile-track/richIntro?trackId=${item.trackId}`)).richIntro;
			if (!_desc) _desc = item.intro;
			return _desc;
		});
	}));
	const token = config.ximalaya.token;
	if (isPaid && token) {
		const randomToken = getRandom16(8) + "-" + getRandom16(4) + "-" + getRandom16(4) + "-" + getRandom16(4) + "-" + getRandom16(12);
		await Promise.all(playList.map(async (item) => {
			const trackPayInfoApi = `https://www.ximalaya.com/mobile-playpage/track/v3/baseInfo/${Math.floor(Date.now())}?device=www2&trackQualityLevel=2&trackId=${item.trackId}`;
			const data = await cache_default.tryGet("ximalaya:trackPayInfo" + trackPayInfoApi, async () => {
				const trackInfo = (await rofetch(trackPayInfoApi, { headers: {
					"user-agent": "ting_6.7.9(GM1900,Android29)",
					cookie: `1&_device=android&${randomToken}&6.7.9;1&_token=${token}`
				} })).trackInfo;
				const _item = {};
				if (!trackInfo.isAuthorized) return _item;
				_item.playPathAacv224 = decryptUrl(trackInfo.playUrlList[0].url);
				return _item;
			});
			if (data.playPathAacv224) item.playPathAacv224 = data.playPathAacv224;
			if (data.desc) item.desc = data.desc;
		}));
	}
	const resultItems = playList.map((item) => {
		const title = item.title;
		const trackId = item.trackId;
		const itunesItemImage = item.coverLarge.split("!", 1)[0] ?? albumCover;
		const link = `${baseUrl}/sound/${trackId}`;
		const pubDate = parseDate(item.createdAt, "x");
		const duration = item.duration;
		const enclosureUrl = item.playPathAacv224 || item.playPathAacv164;
		let resultItem = {
			title,
			link,
			description: item.desc || "",
			pubDate,
			itunes_item_image: itunesItemImage
		};
		if (enclosureUrl) {
			if (isPaid) resultItem.description = "[该内容需付费] " + resultItem.description;
			resultItem = {
				...resultItem,
				enclosure_url: enclosureUrl,
				itunes_duration: duration,
				enclosure_type: "audio/x-m4a"
			};
		} else resultItem.description = "[该内容需付费] " + resultItem.description;
		return resultItem;
	});
	return {
		title: albumTitle,
		link: `${baseUrl}/${type}/${id}`,
		description: albumIntro,
		image: albumCover,
		itunes_author: author,
		itunes_category: categoryDict[albumCategory] || albumCategory,
		item: resultItems
	};
}
//#endregion
export { route };
