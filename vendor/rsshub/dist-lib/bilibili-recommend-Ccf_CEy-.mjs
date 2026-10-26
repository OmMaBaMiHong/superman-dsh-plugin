import { t as got_default } from "./got-Dnzt41dd.mjs";
import { r as utils_default } from "./utils-BLUZ3MUn.mjs";
//#region lib/routes/bilibili/bilibili-recommend.ts
const route = {
	path: "/precious/:embed?",
	categories: ["social-media"],
	example: "/bilibili/precious",
	parameters: { embed: "默认为开启内嵌视频, 任意值为关闭" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "入站必刷",
	maintainers: ["liuyuhe666"],
	handler
};
async function handler(ctx) {
	const embed = !ctx.req.param("embed");
	return {
		title: "哔哩哔哩入站必刷",
		link: "https://www.bilibili.com/v/popular/history",
		item: (await got_default({
			method: "get",
			url: "https://api.bilibili.com/x/web-interface/popular/precious",
			headers: { Referer: "https://www.bilibili.com/v/popular/history" }
		})).data.data.list.map((item) => ({
			title: item.title,
			description: utils_default.renderUGCDescription(embed, item.pic, item.desc || item.title, item.aid, void 0, item.bvid),
			link: item.bvid ? `https://www.bilibili.com/video/${item.bvid}` : `https://www.bilibili.com/video/av${item.aid}`
		}))
	};
}
//#endregion
export { route };
