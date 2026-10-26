import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { load } from "cheerio";
//#region lib/routes/sehuatang/user.ts
const baseUrl = "https://sehuatang.org/";
const route = {
	path: "/user/:uid",
	categories: ["multimedia"],
	example: "/sehuatang/user/411096",
	parameters: { uid: "用户 uid, 可在用户主页 URL 中找到" },
	features: {
		requireConfig: [{
			name: "SEHUATANG_COOKIE",
			description: ""
		}],
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	name: "作者文章",
	maintainers: ["JamYiz"],
	handler
};
async function handler(ctx) {
	if (!config.sehuatang.cookie) throw new ConfigNotFoundError("Sehuatang RSS is disabled due to the lack of <a href=\"https://docs.rsshub.app/deploy/config#route-specific-configurations\">relevant config</a>");
	const uid = ctx.req.param("uid");
	const link = `${baseUrl}home.php?mod=space&uid=${uid}&do=thread&view=me&from=space`;
	const $ = load((await got_default(link, { headers: {
		Cookie: config.sehuatang.cookie,
		"Accept-Encoding": "gzip, deflate, br",
		"Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8"
	} })).data);
	const list = $("#delform tr:not(.th)").slice(0, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 25).toArray().map((item) => {
		item = $(item);
		const a = item.find("th>a").first();
		return {
			title: `[${item.find(".xg1").first().text()}] ${a.text()}`,
			link: baseUrl + a.attr("href"),
			author: $(".mt").first().text()
		};
	});
	const out = await Promise.all(list.map((info) => cache_default.tryGet(info.link, async () => {
		const $ = load((await got_default(info.link, { headers: {
			Cookie: config.sehuatang.cookie,
			"Accept-Encoding": "gzip, deflate, br",
			"Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8"
		} })).data);
		const postMessage = $("[id^='postmessage']").slice(0, 1);
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
		const dateString = $(".authi em").first().text();
		const datetimeString = `${dateString.split(" ", 2)[1]} ${dateString.split(" ", 3)[2]}`;
		const timestamp = new Date(datetimeString).getTime();
		info.pubDate = $(".authi em span").length > 0 ? parseDate($(".authi em span").attr("title")) : parseDate(timestamp);
		const magnet = postMessage.find("div.blockcode li").first().text();
		const isMag = magnet.startsWith("magnet");
		const torrent = postMessage.find("p.attnm a").attr("href");
		if (isMag || torrent !== void 0) {
			info.enclosure_url = isMag ? magnet : new URL(torrent, baseUrl).href;
			info.enclosure_type = isMag ? "application/x-bittorrent" : "application/octet-stream";
		}
		return info;
	})));
	return {
		title: `${$(".mt").text()}的帖子-色花堂`,
		link,
		item: out
	};
}
//#endregion
export { route };
