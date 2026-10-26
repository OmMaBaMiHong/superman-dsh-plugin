import { t as config } from "./config-B5Cf_tHS.mjs";
import { i as parseDuration } from "./helpers-5QIj7EjI.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as getVideoUrl, r as utils_default } from "./utils-BLUZ3MUn.mjs";
import { t as cache_default } from "./cache-DzpZriu0.mjs";
//#region lib/routes/bilibili/weekly-recommend.ts
const route = {
	path: "/weekly/:embed?",
	categories: ["social-media"],
	example: "/bilibili/weekly",
	parameters: { embed: "默认为开启内嵌视频, 任意值为关闭" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "B 站每周必看",
	maintainers: ["ttttmr"],
	handler
};
async function handler(ctx) {
	const isJsonFeed = ctx.req.query("format") === "json";
	const embed = !ctx.req.param("embed");
	const status_response = await got_default({
		method: "get",
		url: "https://app.bilibili.com/x/v2/show/popular/selected/series?type=weekly_selected",
		headers: { Referer: "https://www.bilibili.com/h5/weekly-recommend" }
	});
	const weekly_number = status_response.data.data[0].number;
	const weekly_name = status_response.data.data[0].name;
	const data = (await got_default({
		method: "get",
		url: `https://app.bilibili.com/x/v2/show/popular/selected?type=weekly_selected&number=${weekly_number}`,
		headers: { Referer: `https://www.bilibili.com/h5/weekly-recommend?num=${weekly_number}&navhide=1` }
	})).data.data.list;
	return {
		title: "B站每周必看",
		link: "https://www.bilibili.com/h5/weekly-recommend",
		description: "B站每周必看",
		item: await Promise.all(data.map(async (item) => {
			const subtitles = isJsonFeed && !config.bilibili.excludeSubtitles && item.bvid ? await cache_default.getVideoSubtitleAttachment(item.bvid) : [];
			return {
				title: item.title,
				description: utils_default.renderUGCDescription(embed, item.cover, `${weekly_name} ${item.title} - ${item.rcmd_reason}`, item.param, void 0, item.bvid),
				link: weekly_number > 60 && item.bvid ? `https://www.bilibili.com/video/${item.bvid}` : `https://www.bilibili.com/video/av${item.param}`,
				attachments: item.bvid ? [{
					url: getVideoUrl(item.bvid),
					mime_type: "text/html",
					duration_in_seconds: parseDuration(item.cover_right_text_1)
				}, ...subtitles] : void 0
			};
		}))
	};
}
//#endregion
export { route };
