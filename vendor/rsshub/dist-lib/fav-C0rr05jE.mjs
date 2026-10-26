import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { r as utils_default } from "./utils-BLUZ3MUn.mjs";
//#region lib/routes/bilibili/fav.ts
const route = {
	path: "/fav/:uid/:fid/:embed?",
	categories: ["social-media"],
	example: "/bilibili/fav/756508/50948568",
	parameters: {
		uid: "用户 id, 可在 UP 主主页中找到",
		fid: "收藏夹 ID, 可在收藏夹的 URL 中找到, 默认收藏夹建议使用 UP 主默认收藏夹功能",
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
	name: "UP 主非默认收藏夹",
	maintainers: ["Qixingchen"],
	handler
};
async function handler(ctx) {
	const fid = ctx.req.param("fid");
	const uid = ctx.req.param("uid");
	const embed = !ctx.req.param("embed");
	const { data, code, message } = (await got_default({
		url: `https://api.bilibili.com/x/v3/fav/resource/list?media_id=${fid}&ps=20`,
		headers: {
			Referer: `https://space.bilibili.com/${uid}/`,
			Cookie: config.bilibili.cookies[uid]
		}
	})).data;
	if (code) throw new Error(message ?? code);
	const username = data.info.upper.name;
	const favName = data.info.title;
	return {
		title: `${username} 的 bilibili 收藏夹 ${favName}`,
		link: `https://space.bilibili.com/${uid}/#/favlist?fid=${fid}`,
		description: `${username} 的 bilibili 收藏夹 ${favName}`,
		item: data.medias && data.medias.map((item) => ({
			title: item.title,
			description: utils_default.renderUGCDescription(embed, item.cover, item.intro, item.id, void 0, item.bvid),
			pubDate: parseDate(item.fav_time * 1e3),
			link: item.fav_time > utils_default.bvidTime && item.bvid ? `https://www.bilibili.com/video/${item.bvid}` : `https://www.bilibili.com/video/av${item.id}`,
			author: item.upper.name
		}))
	};
}
//#endregion
export { route };
