import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import crypto from "node:crypto";
//#region lib/routes/qingting/podcast.ts
const qingtingId = config.qingting.id ?? "";
const route = {
	path: "/podcast/:id",
	categories: ["multimedia"],
	example: "/qingting/podcast/293411",
	parameters: { id: "专辑id, 可在专辑页 URL 中找到" },
	features: {
		supportPodcast: true,
		requireConfig: [{
			name: "QINGTING_ID",
			optional: true,
			description: "用户id， 部分专辑需要会员身份，用户id可以通过从网页端登录蜻蜓fm后使用开发者工具，在控制台中运行JSON.parse(localStorage.getItem(\"user\")).qingting_id获取"
		}]
	},
	radar: [{ source: ["qingting.fm/channels/:id"] }],
	name: "播客",
	maintainers: [
		"RookieZoe",
		"huyyi",
		"pseudoyu"
	],
	handler,
	description: "获取的播放 URL 有效期只有 1 天，需要开启播客 APP 的自动下载功能。"
};
function getMediaUrl(channelId, mediaId) {
	const path = `/audiostream/redirect/${channelId}/${mediaId}?access_token=&device_id=MOBILESITE&qingting_id=${qingtingId}&t=${Date.now()}`;
	return `https://audio.qingting.fm${path}&sign=${crypto.createHmac("md5", "fpMn12&38f_2e").update(path).digest("hex").toString()}`;
}
async function handler(ctx) {
	const channelId = ctx.req.param("id");
	const pageSize = Number(ctx.req.query("limit")) || 30;
	const response = await rofetch(`https://i.qingting.fm/capi/v3/channel/${channelId}`, { headers: { Referer: "https://www.qingting.fm/" } });
	const title = response.data.title;
	const channel_img = response.data.thumbs["400_thumb"];
	const authors = response.data.podcasters.map((author) => author.nick_name).join(",");
	const desc = response.data.description;
	const { data: { programs } } = await rofetch(`https://i.qingting.fm/capi/channel/${channelId}/programs/${response.data.v}?curpage=1&pagesize=${pageSize}&order=asc`, { headers: { Referer: "https://www.qingting.fm/" } });
	const { data: channelInfo } = await rofetch(`https://i.qingting.fm/capi/v3/channel/${channelId}?user_id=${qingtingId}`);
	const isCharged = channelInfo.purchase?.item_type !== 0;
	const isPaid = channelInfo.user_relevance?.sale_status === "paid";
	const resultItems = await Promise.all(programs.map(async (item) => {
		const data = await cache_default.tryGet(`qingting:podcast:${channelId}:${item.id}`, async () => {
			const link = `https://www.qingting.fm/channels/${channelId}/programs/${item.id}/`;
			const detailRes = await rofetch(link, { headers: { Referer: "https://www.qingting.fm/" } });
			const detail = JSON.parse(detailRes.match(/\},"program":(.*?),"plist":/)[1]);
			return {
				title: item.title,
				link,
				itunes_item_image: item.cover,
				itunes_duration: item.duration,
				pubDate: timezone(parseDate(item.update_time), 8),
				description: detail.richtext
			};
		});
		if (!isCharged || isPaid || item.isfree) {
			data.enclosure_url = getMediaUrl(channelId, item.id);
			data.enclosure_type = "audio/x-m4a";
		}
		return data;
	}));
	return {
		title: `${title} - 蜻蜓FM`,
		description: desc,
		itunes_author: authors,
		image: channel_img,
		link: `https://www.qingting.fm/channels/${channelId}`,
		item: resultItems
	};
}
//#endregion
export { route };
