import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as renderPlaylistDescription } from "./playlist-BQCsRZrj.mjs";
//#region lib/routes/163/music/playlist.ts
const route = {
	path: "/music/playlist/:id",
	categories: ["multimedia"],
	example: "/163/music/playlist/35798529",
	parameters: { id: "歌单 id, 可在歌单页 URL 中找到" },
	features: {
		requireConfig: [{
			name: "NCM_COOKIES",
			optional: true,
			description: "网易云音乐登陆后的 cookie 值，可在浏览器控制台通过`document.cookie`获取。"
		}],
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "歌单歌曲",
	maintainers: ["DIYgod"],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const data = (await got_default.get(`https://music.163.com/api/v3/playlist/detail?id=${id}`, { headers: {
		Referer: "https://music.163.com/",
		Cookie: config.ncm.cookies
	} })).data.playlist;
	const songs = (await got_default("https://music.163.com/api/song/detail", {
		headers: { Referer: "https://music.163.com" },
		searchParams: { ids: `[${data.trackIds.slice(0, 201).map((item) => item.id)}]` }
	})).data.songs;
	return {
		title: data.name,
		link: `https://music.163.com/#/playlist?id=${id}`,
		description: `网易云音乐歌单 - ${data.name}`,
		item: data.trackIds.slice(0, 201).map((item) => {
			const thisSong = songs.find((element) => element.id === item.id);
			let singer = thisSong.artists[0].name;
			for (const artist of thisSong.artists.slice(1)) singer += "/" + artist.name;
			return {
				title: `${thisSong.name} - ${singer}`,
				description: renderPlaylistDescription({
					singer,
					album: thisSong.album.name,
					date: new Date(thisSong.album.publishTime).toLocaleDateString(),
					picUrl: thisSong.album.picUrl
				}),
				link: `https://music.163.com/song?id=${item.id}`,
				guid: `https://music.163.com/#/song?id=${item.id}`,
				pubDate: new Date(item.at),
				author: singer
			};
		})
	};
}
//#endregion
export { route };
