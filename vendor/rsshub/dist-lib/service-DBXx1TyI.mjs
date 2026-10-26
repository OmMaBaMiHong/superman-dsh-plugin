import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as md5 } from "./md5-CpIHIxCO.mjs";
//#region lib/routes/showstart/const.ts
const HOST = "https://www.showstart.com";
const TITLE = "秀动网";
//#endregion
//#region lib/routes/showstart/utils.ts
const uuid = (length = 20) => {
	const e = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz" + Date.now();
	const r = [];
	for (let i = 0; i < length; i++) {
		const index = Math.floor(Math.random() * e.length);
		r.push(e.charAt(index));
	}
	return r.join("");
};
const cookieMap = /* @__PURE__ */ new Map([["token", uuid(32).toLowerCase()]]);
const devioceInfo = {
	vendorName: "",
	deviceMode: "",
	deviceName: "",
	systemName: "",
	systemVersion: "",
	cpuMode: " ",
	cpuCores: "",
	cpuArch: "",
	memerySize: "",
	diskSize: "",
	network: "",
	resolution: "1920*1080",
	pixelResolution: ""
};
const getAccessToken = async () => {
	const { result } = await post("/waf/gettoken");
	cookieMap.set("accessToken", result.accessToken.access_token);
	cookieMap.set("idToken", result.idToken.id_token);
	return cookieMap.get("accessToken");
};
const post = async (requestPath, accessToken = md5(Date.now().toString()), payload) => {
	const traceId = uuid(32) + Date.now();
	return await rofetch(`https://www.showstart.com/api${requestPath}`, {
		method: "POST",
		headers: {
			cdeviceinfo: encodeURIComponent(JSON.stringify(devioceInfo)),
			cdeviceno: cookieMap.get("token"),
			cookie: [...cookieMap].map(([key, value]) => `${key}=${value}`).join("; "),
			crpsign: md5(accessToken + "web" + cookieMap.get("token") + (payload ? JSON.stringify(payload) : "") + requestPath + "999web" + traceId),
			crtraceid: traceId,
			csappid: "web",
			cterminal: "web",
			cusat: accessToken,
			cusid: "",
			cusit: "",
			cusname: "",
			cusut: "",
			cversion: "999"
		},
		body: payload
	});
};
function sortBy(items, key) {
	return items.toSorted((a, b) => a[key].localeCompare(b[key]));
}
function uniqBy(items, key) {
	const set = /* @__PURE__ */ new Set();
	return items.filter((item) => {
		if (set.has(item[key])) return false;
		set.add(item[key]);
		return true;
	});
}
//#endregion
//#region lib/routes/showstart/service.ts
async function fetchActivityList(params) {
	params.pageNo ||= "1";
	params.pageSize ||= "30";
	return (await post("/web/activity/list", await getAccessToken(), params)).result.result.map((item) => formatActivity(item));
}
const image = (src) => src ? `<img src="${src}" />` : "";
const time = (time) => time ? `<p>演出时间：${time}</p>` : "";
const address = (cityName, siteName) => cityName || siteName ? `<p>地址：${[cityName, siteName].join(" - ")}</p>` : "";
const performers = (name) => name ? `<p>艺人：${name}</p>` : "";
const price = (price) => price ? `<p>票价：${price}</p>` : "";
function formatActivity(item) {
	return {
		title: item.title,
		link: `${HOST}/event/${item.id}`,
		description: [
			image(item.poster),
			time(item.showTime),
			address(item.cityName, item.siteName),
			performers(item.performers),
			price(item.price)
		].join("")
	};
}
async function fetchPerformerList(params) {
	params.pageNo ||= "1";
	params.pageSize ||= "30";
	return (await post("/web/performer/list", await getAccessToken(), params)).result.result.map((item) => ({
		title: item.name,
		link: `${HOST}/artist/${item.id}`,
		description: `id: ${item.id}`
	}));
}
async function fetchPerformerInfo(params) {
	const resp = await post("/web/performer/info", await getAccessToken(), params);
	return {
		id: params.performerId,
		name: resp.result.name,
		content: resp.result.content,
		avatar: resp.result.avatar,
		poster: resp.result.poster,
		styles: resp.result.styles,
		activityList: resp.result.activities.map((item) => formatActivity(item))
	};
}
async function fetchBrandInfo(params) {
	const resp = await post("/web/brand/info", await getAccessToken(), params);
	return {
		id: params.brandId,
		name: resp.result.name,
		content: resp.result.content,
		avatar: resp.result.avatar,
		poster: resp.result.poster,
		activityList: resp.result.activities.map((item) => formatActivity(item))
	};
}
async function fetchSiteList(params) {
	params.pageNo ||= "1";
	params.pageSize ||= "30";
	return (await post("/web/site/list", await getAccessToken(), params)).result.result.map((item) => ({
		title: `${item.cityName} - ${item.name}`,
		link: `${HOST}/venue/${item.id}`,
		description: `id: ${item.id}`
	}));
}
async function fetchSiteInfo(params) {
	const resp = await post("/web/site/info", await getAccessToken(), params);
	return {
		id: params.siteId,
		name: `${resp.result.cityName} - ${resp.result.name}`,
		address: resp.result.address,
		avatar: resp.result.avatar,
		poster: resp.result.poster
	};
}
async function fetchBrandList(params) {
	params.pageNo ||= "1";
	params.pageSize ||= "30";
	return (await post("/web/brand/list", await getAccessToken(), params)).result.result.map((item) => ({
		title: item.name,
		link: `${HOST}/host/${item.id}`,
		description: `id: ${item.id}`
	}));
}
async function fetchParams() {
	return post("/web/activity/list/params", await getAccessToken());
}
async function fetchCityList(keyword = "") {
	return sortBy((await fetchParams()).result, "cityCode").filter((item) => item.cityName.includes(keyword.trim())).map((item) => ({
		title: item.cityName,
		link: `${HOST}/event/list?cityCode=${item.cityCode}`,
		description: `cityCode: ${item.cityCode}`
	}));
}
async function fetchStyleList(keyword = "") {
	let styles = (await fetchParams()).result.flatMap((item) => item.styles);
	styles = uniqBy(styles, "key");
	styles = sortBy(styles, "key");
	return styles.filter((item) => item.showName.includes(keyword.trim())).map((item) => ({
		title: item.showName,
		link: `${HOST}/event/list?showStyle=${item.key}`,
		description: `showStyle: ${item.key}`
	}));
}
async function fetchDictionary(cityCode, showStyle) {
	const target = (await fetchParams()).result.find((item) => String(item.cityCode) === cityCode);
	if (!target) return {};
	return {
		cityName: target.cityName,
		showName: target.styles.find((item) => String(item.key) === showStyle)?.showName
	};
}
//#endregion
export { fetchDictionary as a, fetchSiteInfo as c, HOST as d, TITLE as f, fetchCityList as i, fetchSiteList as l, fetchBrandInfo as n, fetchPerformerInfo as o, fetchBrandList as r, fetchPerformerList as s, fetchActivityList as t, fetchStyleList as u };
