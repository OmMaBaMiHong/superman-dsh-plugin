import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
//#region lib/routes/maoyan/coming.ts
const route = {
	path: "/coming",
	categories: ["multimedia"],
	example: "/maoyan/coming",
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
		source: ["www.maoyan.com/films?showType=2", "www.maoyan.com/films"],
		target: "/coming"
	}],
	name: "即将上映",
	maintainers: ["JackyST0"],
	handler
};
async function handler() {
	return {
		title: "猫眼电影 - 即将上映",
		link: "https://www.maoyan.com/films?showType=2",
		description: "猫眼电影即将上映列表",
		item: ((await rofetch("https://m.maoyan.com/ajax/comingList?ci=1&limit=30&movieIds=&token=")).coming || []).map((movie) => ({
			title: `[${movie.comingTitle}] ${movie.nm}`,
			link: `https://www.maoyan.com/films/${movie.id}`,
			description: `
            <img src="${movie.img}" />
            <p><strong>${movie.nm}</strong></p>
            <p>上映时间：${movie.rt}</p>
            <p>主演：${movie.star}</p>
            <p>想看人数：${movie.wish}</p>
            ${movie.showInfo ? `<p>${movie.showInfo}</p>` : ""}
        `
		}))
	};
}
//#endregion
export { route };
