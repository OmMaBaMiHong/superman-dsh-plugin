import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
//#region lib/routes/gamer/ani/new-anime.ts
const route = {
	path: "/ani/new_anime",
	categories: ["anime"],
	view: 3,
	example: "/gamer/ani/new_anime",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["ani.gamer.com.tw/"],
		target: "/new_anime"
	}],
	name: "動畫瘋 - 最後更新",
	maintainers: ["maple3142", "pseudoyu"],
	handler,
	url: "ani.gamer.com.tw/"
};
async function handler() {
	const rootUrl = "https://ani.gamer.com.tw";
	const { data: response } = await got_default("https://api.gamer.com.tw/mobile_app/anime/v3/index.php");
	return {
		title: "動畫瘋最後更新",
		link: rootUrl,
		item: response.data.newAnime.date.map((item) => ({
			title: `${item.title} ${item.volume}`,
			description: `<img src="${item.cover}">`,
			link: `${rootUrl}/animeVideo.php?sn=${item.videoSn}`,
			pubDate: timezone(parseDate(`${item.upTime} ${item.upTimeHours}`, "MM/DD HH:mm"), 8)
		}))
	};
}
//#endregion
export { route };
