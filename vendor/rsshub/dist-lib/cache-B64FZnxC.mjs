import { t as cache_default$1 } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { JSDOM } from "jsdom";
//#region lib/routes/qq/kg/cache.ts
var cache_default = { getPlayInfo: async (ctx, shareId, ksong_mid = "") => {
	const link = `https://node.kg.qq.com/play?s=${shareId}`;
	const cache_key = ksong_mid ? `ksong:${ksong_mid}` : link;
	return await cache_default$1.tryGet(cache_key, async () => {
		const { window } = new JSDOM((await got_default(link)).data, { runScripts: "dangerously" });
		const data = window.__DATA__;
		const name = data.detail.song_name;
		const description = data.detail.content;
		const author = data.detail.nick;
		const itunes_item_image = data.detail.cover;
		const enclosure_url = data.detail.playurl;
		ksong_mid ??= data.detail.ksong_mid;
		const ctime = data.detail.ctime;
		const comments = data.detail.comments;
		return {
			name,
			link,
			description,
			author,
			enclosure_url,
			ksong_mid,
			ctime,
			itunes_item_image,
			comments
		};
	});
} };
//#endregion
export { cache_default as t };
