import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as renderDescription } from "./description-Cg5sBZFH.mjs";
//#region lib/routes/futunn/video.ts
const route = {
	path: "/video",
	categories: ["finance"],
	example: "/futunn/video",
	features: { supportRadar: true },
	radar: [{
		source: ["news.futunn.com/main/video-list", "news.futunn.com/:lang/main/video-list"],
		target: "/video"
	}],
	name: "视频",
	maintainers: ["kennyfong19931"],
	handler
};
async function handler(ctx) {
	const limit = ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 50;
	const rootUrl = "https://news.futunn.com";
	return {
		title: "富途牛牛 - 视频",
		link: `${rootUrl}/main/video-list`,
		item: (await got_default({
			method: "get",
			url: `${rootUrl}/news-site-api/main/get-video-list?size=${limit}`
		})).data.data.videoList.list.map((item) => ({
			title: item.title,
			description: renderDescription({
				abs: item.abstract,
				pic: item.videoImg
			}),
			link: item.targetUrl,
			pubDate: parseDate(item.timestamp * 1e3)
		}))
	};
}
//#endregion
export { route };
