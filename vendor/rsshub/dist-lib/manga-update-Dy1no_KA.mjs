import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/bilibili/manga-update.ts
const route = {
	path: "/manga/update/:comicid",
	categories: ["social-media"],
	example: "/bilibili/manga/update/26009",
	parameters: { comicid: "漫画 id, 可在 URL 中找到, 支持带有`mc`前缀" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["manga.bilibili.com/detail/:comicid"] }],
	name: "漫画更新",
	maintainers: ["hoilc"],
	handler
};
async function genReqSign(query, body) {
	const { Go } = await import("./wasm-exec-BeETsXSx.mjs");
	const wasmBufferBase64 = await cache_default.tryGet("bilibili-manga-wasm-20250208", async () => {
		const wasmResp = await got_default("https://s1.hdslb.com/bfs/manga-static/manga-pc/6732b1bf426cfc634293.wasm", { responseType: "arrayBuffer" });
		return Buffer.from(wasmResp.data).toString("base64");
	});
	const wasmBuffer = Buffer.from(wasmBufferBase64, "base64");
	const go = new Go();
	const { instance } = await WebAssembly.instantiate(wasmBuffer, go.importObject);
	go.run(instance);
	if (void 0 === globalThis.genReqSign) throw new Error("WASM function not available");
	return globalThis.genReqSign(query, body, Date.now()).sign;
}
async function handler(ctx) {
	const comic_id = ctx.req.param("comicid").startsWith("mc") ? ctx.req.param("comicid").replace("mc", "") : ctx.req.param("comicid");
	const link = `https://manga.bilibili.com/detail/mc${comic_id}`;
	const spi_response = await got_default("https://api.bilibili.com/x/frontend/finger/spi");
	const query = "device=pc&platform=web&nov=25";
	const body = JSON.stringify({ comic_id: Number(comic_id) });
	const data = (await got_default({
		method: "POST",
		url: `https://manga.bilibili.com/twirp/comic.v2.Comic/ComicDetail?${query}&ultra_sign=${await genReqSign(query, body)}`,
		body,
		headers: {
			Referer: link,
			Cookie: `buvid3=${spi_response.data.data.b_3}; buvid4=${spi_response.data.data.b_4}`
		}
	})).data.data;
	const author = data.author_name.join(", ");
	return {
		title: `${data.title} - 哔哩哔哩漫画`,
		link,
		image: data.vertical_cover,
		description: data.classic_lines,
		item: data.ep_list.slice(0, 20).map((item) => ({
			title: item.short_title === item.title ? item.short_title : `${item.short_title} ${item.title}`,
			author,
			description: `<img src="${item.cover}">`,
			pubDate: /* @__PURE__ */ new Date(item.pub_time + " +0800"),
			link: `https://manga.bilibili.com/mc${comic_id}/${item.id}`
		}))
	};
}
//#endregion
export { route };
