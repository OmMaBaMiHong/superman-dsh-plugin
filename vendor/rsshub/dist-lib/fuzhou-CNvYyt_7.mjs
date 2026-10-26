import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/dushu/fuzhou/index.tsx
const host = "https://gateway-api-ipv4.dushu365.com/compose-orch/offlineActivity/v100/activity/list";
const link = "https://card.dushu.io/requirement/offline-activity/host-home/v/index.html?webview-type=rn&hostId=xtntzsnwsnkw511r";
const transformTime = (item) => {
	const startTime = new Date(item.startTime);
	item.startTime = `${startTime.getFullYear()}-${startTime.getMonth() + 1}-${startTime.getDate()} ${startTime.getHours()}:${startTime.getMinutes()}`;
	const endTime = new Date(item.endTime);
	item.endTime = `${endTime.getFullYear()}-${endTime.getMonth() + 1}-${endTime.getDate()} ${endTime.getHours()}:${endTime.getMinutes()}`;
};
const route = {
	path: "/fuzhou",
	categories: ["new-media"],
	example: "/dushu/fuzhou",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.dushu365.com*"] }],
	name: "樊登福州运营中心",
	maintainers: ["Fatpandac"],
	handler,
	url: "www.dushu365.com*"
};
async function handler() {
	const data = (await rofetch(host, {
		method: "POST",
		body: {
			channelTid: "xtntzsnwsnkw511r",
			pageNo: 1,
			pageSize: 10,
			type: 0
		}
	})).data.activityListVOS;
	data.map((element) => transformTime(element));
	return {
		title: "樊登福州运营中心",
		link,
		item: data.map((item) => ({
			title: item.activityName,
			link: "https://card.dushu.io/requirement/offline-activity/activity-detail/v/index.html?productId=" + item.activityId + "&type=" + item.type,
			description: renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsx("text", { children: `地区：${item.areaName}` }),
				/* @__PURE__ */ jsx("br", {}),
				/* @__PURE__ */ jsx("text", { children: `地点：${item.address}` }),
				/* @__PURE__ */ jsx("br", {}),
				/* @__PURE__ */ jsx("text", { children: `开始时间： ${item.startTime}` }),
				/* @__PURE__ */ jsx("br", {}),
				/* @__PURE__ */ jsx("text", { children: `结束时间： ${item.endTime}` }),
				/* @__PURE__ */ jsx("br", {}),
				/* @__PURE__ */ jsx("img", {
					style: "heigth:500px;width:500px",
					src: item.posterImg
				})
			] }))
		}))
	};
}
//#endregion
export { route };
