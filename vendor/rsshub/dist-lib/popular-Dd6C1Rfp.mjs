import { t as got_default } from "./got-Dnzt41dd.mjs";
import { r as utils_default } from "./utils-BLUZ3MUn.mjs";
//#region lib/routes/bilibili/popular.ts
const route = {
	path: "/popular/all/:embed?",
	categories: ["social-media"],
	example: "/bilibili/popular/all",
	parameters: { embed: "默认为开启内嵌视频, 任意值为关闭" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "综合热门",
	maintainers: ["ziminliu"],
	handler
};
async function handler(ctx) {
	const embed = !ctx.req.param("embed");
	const list = (await got_default({
		method: "get",
		url: "https://api.bilibili.com/x/web-interface/popular",
		headers: { Referer: "https://www.bilibili.com/" }
	})).data.data.list;
	return {
		title: "bilibili 综合热门",
		link: "https://www.bilibili.com",
		description: "bilibili 综合热门",
		item: list && list.map((item) => ({
			title: item.title,
			description: utils_default.renderUGCDescription(embed, item.pic, item.desc, item.aid, void 0, item.bvid),
			pubDate: (/* @__PURE__ */ new Date(item.pubdate * 1e3)).toUTCString(),
			link: item.pubdate > utils_default.bvidTime && item.bvid ? `https://www.bilibili.com/video/${item.bvid}` : `https://www.bilibili.com/video/av${item.aid}`,
			author: item.owner.name
		}))
	};
}
//#endregion
export { route };
