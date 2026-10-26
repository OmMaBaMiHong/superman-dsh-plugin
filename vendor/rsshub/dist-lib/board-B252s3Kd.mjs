import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { n as getBoard } from "./util-BAxAjUpU.mjs";
//#region lib/routes/xiaohongshu/board.ts
const route = {
	path: "/board/:board_id",
	categories: ["social-media"],
	example: "/xiaohongshu/board/5db6f79200000000020032df",
	parameters: { board_id: "专辑 ID" },
	features: {
		requireConfig: false,
		requirePuppeteer: true,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["xiaohongshu.com/board/:board_id"] }],
	name: "专辑",
	maintainers: ["lotosbin"],
	handler
};
async function handler(ctx) {
	const url = `https://www.xiaohongshu.com/board/${ctx.req.param("board_id")}`;
	const main = await getBoard(url, cache_default);
	const albumInfo = main.albumInfo;
	const title = albumInfo.name;
	const description = albumInfo.desc;
	return {
		title,
		link: url,
		image: albumInfo.user.images.split("?imageView2", 1)[0],
		item: main.notesDetail.map((item) => ({
			title: item.title,
			link: `https://www.xiaohongshu.com/discovery/item/${item.id}`,
			description: `<img src ="${item.cover.url.split("?imageView2", 1)[0]}"><br>${item.title}`,
			author: item.user.nickname,
			pubDate: timezone(parseDate(item.time), 8)
		})),
		description
	};
}
//#endregion
export { route };
