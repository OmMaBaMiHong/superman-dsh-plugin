import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
//#region lib/routes/maoyan/hot.ts
const route = {
	path: "/hot",
	categories: ["multimedia"],
	example: "/maoyan/hot",
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
		source: ["www.maoyan.com/films?showType=1"],
		target: "/hot"
	}],
	name: "正在热映",
	maintainers: ["JackyST0"],
	handler
};
async function handler() {
	return {
		title: "猫眼电影 - 正在热映",
		link: "https://www.maoyan.com/films?showType=1",
		description: "猫眼电影正在热映列表",
		item: ((await rofetch("https://m.maoyan.com/ajax/movieOnInfoList")).movieList || []).map((movie) => ({
			title: `${movie.sc ? `[${movie.sc}分] ` : ""}${movie.nm}`,
			link: `https://www.maoyan.com/films/${movie.id}`,
			description: `
            <img src="${movie.img}" />
            <p><strong>${movie.nm}</strong></p>
            ${movie.sc ? `<p>评分：${movie.sc}</p>` : ""}
            <p>上映时间：${movie.rt}</p>
            <p>主演：${movie.star}</p>
            <p>想看人数：${movie.wish}</p>
            <p>${movie.showInfo}</p>
        `
		}))
	};
}
//#endregion
export { route };
