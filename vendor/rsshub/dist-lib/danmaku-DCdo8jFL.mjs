import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as cache_default } from "./cache-DzpZriu0.mjs";
import R from "node:zlib";
import { load } from "cheerio";
//#region lib/routes/bilibili/danmaku.ts
const processFloatTime = (time) => {
	const totalSeconds = Number.parseInt(time);
	const seconds = totalSeconds % 60;
	const minutes = (totalSeconds - seconds) / 60 % 60;
	return `${(totalSeconds - seconds - 60 * minutes) / 3600}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};
const route = {
	path: "/video/danmaku/:bvid/:pid?",
	categories: ["social-media"],
	example: "/bilibili/video/danmaku/BV1vA411b7ip/1",
	parameters: {
		bvid: "视频AV号,可在视频页 URL 中找到",
		pid: "分P号,不填默认为1"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "视频弹幕",
	maintainers: ["Qixingchen"],
	handler
};
async function handler(ctx) {
	let bvid = ctx.req.param("bvid");
	let aid;
	if (!bvid.startsWith("BV")) {
		aid = bvid;
		bvid = null;
	}
	const pid = Number(ctx.req.param("pid") || 1);
	const limit = 50;
	const cid = await cache_default.getCidFromId(aid, pid, bvid);
	const videoName = await cache_default.getVideoNameFromId(aid, bvid);
	const link = `https://www.bilibili.com/video/${bvid || `av${aid}`}`;
	let danmakuText = (await got_default.get(`https://comment.bilibili.com/${cid}.xml`, {
		decompress: false,
		responseType: "buffer",
		headers: { Referer: link }
	})).body;
	danmakuText = await ((danmakuText[0] & 15) === 8 ? R.inflateSync(danmakuText) : R.inflateRawSync(danmakuText));
	let danmakuList = [];
	const $ = load(danmakuText, { xmlMode: true });
	$("d").each((index, item) => {
		danmakuList.push({
			p: $(item).attr("p"),
			text: $(item).text()
		});
	});
	danmakuList = danmakuList.toReversed().slice(0, limit);
	return {
		title: `${videoName} 的 弹幕动态`,
		link,
		description: `${videoName} 的 弹幕动态`,
		item: danmakuList.map((item) => ({
			title: `[${processFloatTime(item.p.split(",", 1)[0])}] ${item.text}`,
			pubDate: (/* @__PURE__ */ new Date(item.p.split(",", 5)[4] * 1e3)).toUTCString(),
			guid: `${cid}-${item.p.split(",", 5)[4]}-${item.p.split(",", 8)[7]}`,
			link
		}))
	};
}
//#endregion
export { route };
