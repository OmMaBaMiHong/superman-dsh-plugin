import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { r as utils_default } from "./utils-BLUZ3MUn.mjs";
import { t as cache_default } from "./cache-DzpZriu0.mjs";
//#region lib/routes/bilibili/user-fav.ts
const route = {
	path: "/user/fav/:uid/:embed?",
	categories: ["social-media"],
	example: "/bilibili/user/fav/2267573",
	parameters: {
		uid: "用户 id, 可在 UP 主主页中找到",
		embed: "默认为开启内嵌视频, 任意值为关闭"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["space.bilibili.com/:uid", "space.bilibili.com/:uid/favlist"],
		target: "/user/fav/:uid"
	}],
	name: "UP 主默认收藏夹",
	maintainers: ["DIYgod"],
	handler
};
async function handler(ctx) {
	const uid = ctx.req.param("uid");
	const embed = !ctx.req.param("embed");
	const name = await cache_default.getUsernameFromUID(uid);
	const data = (await got_default({
		method: "get",
		url: `https://api.bilibili.com/x/v2/fav/video?vmid=${uid}&ps=30&tid=0&keyword=&pn=1&order=fav_time`,
		headers: {
			Referer: `https://space.bilibili.com/${uid}/#/favlist`,
			Cookie: config.bilibili.cookies[uid]
		}
	})).data;
	return {
		title: `${name} 的 bilibili 收藏夹`,
		link: `https://space.bilibili.com/${uid}/#/favlist`,
		description: `${name} 的 bilibili 收藏夹`,
		item: data.data && data.data.archives && data.data.archives.map((item) => ({
			title: item.title,
			description: utils_default.renderUGCDescription(embed, item.pic, item.desc, item.aid, void 0, item.bvid),
			pubDate: (/* @__PURE__ */ new Date(item.fav_at * 1e3)).toUTCString(),
			link: item.fav_at > utils_default.bvidTime && item.bvid ? `https://www.bilibili.com/video/${item.bvid}` : `https://www.bilibili.com/video/av${item.aid}`,
			author: item.owner.name
		}))
	};
}
//#endregion
export { route };
