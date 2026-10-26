import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { r as utils_default } from "./utils-BLUZ3MUn.mjs";
import { t as cache_default } from "./cache-DzpZriu0.mjs";
//#region lib/routes/bilibili/coin.ts
const route = {
	path: "/user/coin/:uid/:embed?",
	categories: ["social-media"],
	example: "/bilibili/user/coin/208259",
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
		source: ["space.bilibili.com/:uid"],
		target: "/user/coin/:uid"
	}],
	name: "UP 主投币视频",
	maintainers: ["DIYgod"],
	handler
};
async function handler(ctx) {
	const uid = ctx.req.param("uid");
	const embed = !ctx.req.param("embed");
	const name = await cache_default.getUsernameFromUID(uid);
	const { data, code, message } = (await got_default({
		url: `https://api.bilibili.com/x/space/coin/video?vmid=${uid}`,
		headers: { Referer: `https://space.bilibili.com/${uid}/` }
	})).data;
	if (code) throw new Error(message ?? code);
	return {
		title: `${name} 的 bilibili 投币视频`,
		link: `https://space.bilibili.com/${uid}`,
		description: `${name} 的 bilibili 投币视频`,
		item: data.map((item) => ({
			title: item.title,
			description: utils_default.renderUGCDescription(embed, item.pic, item.desc, item.aid, void 0, item.bvid),
			pubDate: parseDate(item.time * 1e3),
			link: item.time > utils_default.bvidTime && item.bvid ? `https://www.bilibili.com/video/${item.bvid}` : `https://www.bilibili.com/video/av${item.aid}`,
			author: item.owner.name
		}))
	};
}
//#endregion
export { route };
