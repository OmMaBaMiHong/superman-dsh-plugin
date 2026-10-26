import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as cache_default } from "./cache-B64FZnxC.mjs";
import { JSDOM } from "jsdom";
//#region lib/routes/qq/kg/user.ts
const route = {
	path: "/kg/:userId",
	categories: ["social-media"],
	example: "/qq/kg/639a9a86272c308e33",
	parameters: { userId: "用户 ID, 可在对应页面的 URL 中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: true,
		supportScihub: false
	},
	name: "全民K歌 - 用户作品列表",
	maintainers: ["zhangxiang012"],
	handler
};
async function handler(ctx) {
	const url = `https://node.kg.qq.com/personal?uid=${ctx.req.param("userId")}`;
	const { window } = new JSDOM((await got_default(url)).data, { runScripts: "dangerously" });
	const data = window.__DATA__;
	const author = data.data.nickname;
	const authorimg = data.data.head_img_url;
	const ugcList = data.data.ugclist;
	const items = await Promise.all(ugcList.map(async (item) => {
		const link = `https://node.kg.qq.com/play?s=${item.shareid}`;
		const item_info = await cache_default.getPlayInfo(ctx, item.shareid, item.ksong_mid);
		return {
			title: item.title || "",
			description: item_info.description,
			link,
			guid: `ksong:${item.ksong_mid}`,
			author,
			pubDate: parseDate(item_info.ctime * 1e3) || parseDate(item.ctime, "X"),
			itunes_item_image: item_info.itunes_item_image || item.avatar,
			enclosure_url: item_info.enclosure_url,
			enclosure_type: "audio/x-m4a"
		};
	}));
	return {
		title: `${author} - 全民K歌`,
		link: url,
		description: data.share.content,
		allowEmpty: true,
		item: items,
		image: authorimg,
		itunes_author: author,
		itunes_category: "全民K歌"
	};
}
//#endregion
export { route };
