import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/bilibili/app.ts
const config = {
	android: "安卓版",
	iphone: "iPhone 版",
	ipad: "iPad HD 版",
	win: "UWP 版",
	android_tv_yst: "TV 版"
};
const route = {
	path: "/app/:id?",
	categories: ["program-update"],
	example: "/bilibili/app/android",
	parameters: { id: "客户端 id，见下表，默认为安卓版" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "更新情报",
	maintainers: ["nczitzk"],
	handler,
	description: `| 安卓版  | iPhone 版 | iPad HD 版 | UWP 版 | TV 版            |
| ------- | --------- | ---------- | ------ | ---------------- |
| android | iphone    | ipad       | win    | android\\_tv\\_yst |`
};
async function handler(ctx) {
	const id = ctx.req.param("id") || "android";
	const rootUrl = "https://app.bilibili.com";
	const items = (await got_default({
		method: "get",
		url: `${rootUrl}/x/v2/version?mobi_app=${id}`
	})).data.data.map((item) => ({
		link: rootUrl,
		title: item.version,
		pubDate: (/* @__PURE__ */ new Date(item.ptime * 1e3)).toUTCString(),
		description: `<li>${item.desc.split("\n-").join("</li><li>-")}</li>`
	}));
	return {
		title: `哔哩哔哩更新情报 - ${config[id]}`,
		link: rootUrl,
		item: items
	};
}
//#endregion
export { route };
