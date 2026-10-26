import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/google/album.ts
const route = {
	path: "/album/:id",
	categories: ["picture"],
	example: "/google/album/msFFnAzKmQmWj76EA",
	parameters: { id: "album ID, can be found in URL, for example, `https://photos.app.goo.gl/msFFnAzKmQmWj76EA` to `msFFnAzKmQmWj76EA`" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Public Albums",
	maintainers: ["hoilc"],
	handler
};
async function handler(ctx) {
	const url = `https://photos.app.goo.gl/${ctx.req.param("id")}?_imcp=1`;
	const response = await got_default.get(url);
	const real_url = response.request.options.url.href;
	const info = JSON.parse(response.data.match(/AF_initDataCallback.*?data:(\[[\s\S]*\])\s/)[1]) || [];
	const album_name = info[3][1];
	const owner_name = info[3][5][2];
	const list = info[1];
	return {
		title: `${owner_name} 创建的 Google 相册 - ${album_name}`,
		link: url,
		item: list.slice(0, 50).map((item) => {
			const time = /* @__PURE__ */ new Date(item[2] * 1);
			const description = Object.keys(item[15]).length > 2 ? `<video src="${item[1][0]}=m18" controls controlslist="nodownload" loop style="max-width: 100%;">` : `<img src="${item[1][0]}=w${item[1][1]}-h${item[1][2]}-no" style="max-width: 100%;">`;
			return {
				title: time.toLocaleString(),
				author: album_name,
				description,
				pubDate: time,
				link: real_url.replace("?", () => `/photo/${item[0]}?`),
				guid: item[0]
			};
		})
	};
}
//#endregion
export { route };
