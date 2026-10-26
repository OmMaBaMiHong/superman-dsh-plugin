import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/sehuatang/index.ts
const host = "https://www.sehuatang.net/";
const forumIdMaps = {
	gcyc: "2",
	yzwmyc: "36",
	yzymyc: "37",
	gqzwzm: "103",
	sjxz: "107",
	vr: "160",
	srym: "104",
	omwm: "38",
	"4k": "151",
	hgzb: "152",
	dmyc: "39",
	yczp: "155",
	ztzp: "125",
	hrjp: "50",
	yzxa: "48",
	omxa: "49",
	ktdm: "117",
	ttxz: "165",
	zhtl: "95",
	mrhj: "106",
	ai: "113",
	ydsc: "111",
	hrxazp: "98"
};
const route = {
	path: [
		"/bt/:subforumid?",
		"/picture/:subforumid",
		"/:subforumid?/:type?",
		"/:subforumid?",
		""
	],
	name: "Forum",
	maintainers: [
		"qiwihui",
		"junfengP",
		"nczitzk"
	],
	handler,
	features: { nsfw: true },
	description: `**原创 BT 电影**

| 国产原创 | 亚洲无码原创 | 亚洲有码原创 | 高清中文字幕 | 三级写真 | VR 视频 | 素人有码 | 欧美无码 | 韩国主播 | 动漫原创 | 综合讨论 |
| -------- | ------------ | ------------ | ------------ | -------- | ------- | -------- | -------- | -------- | -------- | -------- |
| gcyc     | yzwmyc       | yzymyc       | gqzwzm       | sjxz     | vr      | srym     | omwm     | hgzb     | dmyc     | zhtl     |

**色花图片**

| 原创自拍 | 转贴自拍 | 华人街拍 | 亚洲性爱 | 欧美性爱 | 卡通动漫 | 套图下载 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| yczp     | ztzp     | hrjp     | yzxa     | omxa     | ktdm     | ttxz     |`
};
const getSafeId = () => cache_default.tryGet("sehuatang:safeid", async () => {
	return load(await rofetch(host))("script:contains(\"safeid\")").text().match(/safeid\s*=\s*'(.+)';/)?.[1];
}, config.cache.routeExpire, false);
async function handler(ctx) {
	const subformName = ctx.req.param("subforumid") ?? "gqzwzm";
	const subformId = Object.hasOwn(forumIdMaps, subformName) ? forumIdMaps[subformName] : subformName;
	const type = ctx.req.param("type");
	const typefilter = type ? `&filter=typeid&typeid=${type}` : "";
	const link = `${host}forum.php?mod=forumdisplay&orderby=dateline&fid=${subformId}${typefilter}`;
	const headers = { Cookie: `_safe=${await getSafeId()};` };
	const $ = load(await rofetch(link, { headers }));
	const list = $("#threadlisttableid tbody[id^=normalthread]").slice(0, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 25).toArray().map((item) => {
		item = $(item);
		return {
			title: `${item.find("th em a").length ? `[${item.find("th em a").text()}]` : ""} ${item.find("a.xst").text()}`,
			link: host + item.find("a.xst").attr("href"),
			pubDate: parseDate(item.find("td.by").find("em span span").attr("title")),
			author: item.find("td.by cite a").first().text()
		};
	});
	const out = await Promise.all(list.map((info) => cache_default.tryGet(info.link, async () => {
		const $ = load(await rofetch(info.link, { headers }));
		const postMessage = $("div[id^=\"postmessage\"], td[id^=\"postmessage\"]").slice(0, 1);
		const images = $(postMessage).find("img");
		for (const image of images) {
			const file = $(image).attr("file");
			if (!file || file === "undefined") $(image).replaceWith("");
			else $(image).replaceWith($(`<img src="${file}">`));
		}
		const pattl = $(".pattl");
		const pattlImages = $(pattl).find("img");
		for (const pattlImage of pattlImages) {
			const file = $(pattlImage).attr("file");
			if (!file || file === "undefined") $(pattlImage).replaceWith("");
			else $(pattlImage).replaceWith($(`<img src="${file}" />`));
		}
		postMessage.append($(pattl));
		$("em[onclick]").remove();
		info.description = (postMessage.html() || "抓取原帖失败").replaceAll("ignore_js_op", "div");
		info.pubDate = timezone(parseDate($(".authi em span").attr("title")), 8);
		const magnet = postMessage.find("div.blockcode li").first().text();
		const isMag = magnet.startsWith("magnet");
		const torrent = postMessage.find("p.attnm a").attr("href");
		if (isMag || torrent !== void 0) {
			info.enclosure_url = isMag ? magnet : new URL(torrent, host).href;
			info.enclosure_type = isMag ? "application/x-bittorrent" : "application/octet-stream";
		}
		return info;
	})));
	return {
		title: `色花堂 - ${$("#pt > div:nth-child(1) > a:last-child").text()}`,
		link,
		item: out
	};
}
//#endregion
export { route };
