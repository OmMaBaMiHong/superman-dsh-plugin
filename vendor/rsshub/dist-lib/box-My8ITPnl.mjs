import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
//#region lib/routes/maoyan/box.ts
const route = {
	path: "/box",
	categories: ["multimedia"],
	example: "/maoyan/box",
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
		source: ["piaofang.maoyan.com/dashboard"],
		target: "/box"
	}],
	name: "实时票房榜",
	maintainers: ["JackyST0"],
	handler
};
async function handler() {
	return {
		title: "猫眼实时票房榜",
		link: "https://piaofang.maoyan.com/dashboard",
		description: "猫眼电影实时票房排行榜",
		item: ((await rofetch("https://piaofang.maoyan.com/dashboard-ajax", { headers: { Referer: "https://piaofang.maoyan.com/dashboard" } })).movieList?.data?.list || []).map((movie, index) => ({
			title: `${index + 1}. ${movie.movieInfo.movieName} - ${movie.sumBoxDesc}`,
			link: `https://www.maoyan.com/films/${movie.movieInfo.movieId}`,
			description: `
            <p><strong>${movie.movieInfo.movieName}</strong></p>
            <p>上映状态：${movie.movieInfo.releaseInfo}</p>
            <p>累计票房：${movie.sumBoxDesc}</p>
            <p>票房占比：${movie.boxRate}</p>
            <p>排片场次：${movie.showCount} 场 (${movie.showCountRate})</p>
            <p>上座率：${movie.avgSeatView}</p>
            <p>场均人次：${movie.avgShowView}</p>
        `
		}))
	};
}
//#endregion
export { route };
