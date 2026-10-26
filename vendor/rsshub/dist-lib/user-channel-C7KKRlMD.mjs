import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { r as utils_default } from "./utils-BLUZ3MUn.mjs";
import { t as cache_default$1 } from "./cache-DzpZriu0.mjs";
//#region lib/routes/bilibili/user-channel.ts
const notFoundData = { title: "此 bilibili 频道不存在" };
const route = {
	path: "/user/channel/:uid/:sid/:embed?",
	categories: ["social-media"],
	example: "/bilibili/user/channel/2267573/396050",
	parameters: {
		uid: "用户 id, 可在 UP 主主页中找到",
		sid: "频道 id, 可在频道的 URL 中找到",
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
	name: "UP 主频道的视频列表",
	maintainers: ["weirongxu"],
	handler
};
async function handler(ctx) {
	const uid = Number.parseInt(ctx.req.param("uid"));
	const sid = Number.parseInt(ctx.req.param("sid"));
	const embed = !ctx.req.param("embed");
	const limit = ctx.req.query("limit") ?? 25;
	const link = `https://space.bilibili.com/${uid}/channel/seriesdetail?sid=${sid}`;
	const channelInfoLink = `https://api.bilibili.com/x/series/series?series_id=${sid}`;
	const channelInfo = await cache_default.tryGet(channelInfoLink, async () => {
		return (await got_default(channelInfoLink, { headers: { Referer: link } })).data.data;
	});
	if (!channelInfo) return notFoundData;
	const [username, face] = await cache_default$1.getUsernameAndFaceFromUID(uid);
	const data = (await got_default(`https://api.bilibili.com/x/series/archives?mid=${uid}&series_id=${sid}&only_normal=true&sort=desc&pn=1&ps=${limit}`, { headers: { Referer: link } })).data.data;
	if (!data.archives) return notFoundData;
	return {
		title: `${username} 的 bilibili 频道 ${channelInfo.meta.name}`,
		link,
		description: `${username} 的 bilibili 频道`,
		image: face,
		logo: face,
		icon: face,
		item: data.archives.map((item) => ({
			title: item.title,
			description: utils_default.renderUGCDescription(embed, item.pic, "", item.aid, void 0, item.bvid),
			pubDate: parseDate(item.pubdate, "X"),
			link: item.pubdate > utils_default.bvidTime && item.bvid ? `https://www.bilibili.com/video/${item.bvid}` : `https://www.bilibili.com/video/av${item.aid}`,
			author: username
		}))
	};
}
//#endregion
export { route };
