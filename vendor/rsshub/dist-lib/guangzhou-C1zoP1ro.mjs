import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/tingshuitz/guangzhou.ts
const route = {
	path: "/guangzhou",
	categories: ["forecast"],
	example: "/tingshuitz/guangzhou",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "广州市",
	maintainers: ["xyqfer"],
	handler
};
async function handler() {
	return {
		title: "停水通知 - 广州市自来水96968",
		link: "https://mp.weixin.qq.com/mp/homepage?__biz=MzA3MDE0NzAxMw%3D%3D&hid=15&sn=270abafdcf67ce4e2b52a049a0aa219a&scene=1&sharer_username=&clicktime=&devicetype=iOS12.2&version=1700042b&lang=zh_CN&nettype=WIFI&ascene=0&fontScale=100&wx_header=1",
		item: (await got_default({
			method: "post",
			url: `https://mp.weixin.qq.com/mp/homepage?__biz=MzA3MDE0NzAxMw%3D%3D&hid=15&sn=270abafdcf67ce4e2b52a049a0aa219a&scene=1&sharer_username=&clicktime=${Math.floor(Date.now() / 1e3)}&devicetype=iOS12.2&version=1700042b&lang=zh_CN&nettype=WIFI&ascene=0&fontScale=100&wx_header=1&cid=0&begin=0&count=5&action=appmsg_list&f=json&r=${Math.random()}&appmsg_token=`
		})).data.appmsg_list.map(({ title, link, digest }) => ({
			title,
			link,
			description: `${title}<br>${digest}...`
		}))
	};
}
//#endregion
export { route };
