import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { i as renderVideo, n as getUserInfoById, r as getUserVideosById } from "./utils-f6SbEfjH.mjs";
//#region lib/routes/nicovideo/video.ts
const handler = async (ctx) => {
	const { id } = ctx.req.param();
	const embed = !ctx.req.param("embed");
	const userInfo = await getUserInfoById(id);
	const items = (await getUserVideosById(id)).map(({ essential: video }) => ({
		title: video.title,
		link: `https://www.nicovideo.jp/watch/${video.id}`,
		pubDate: parseDate(video.registeredAt),
		author: [{
			name: video.owner.name,
			avatar: video.owner.iconUrl,
			url: `https://www.nicovideo.jp/user/${video.owner.id}`
		}],
		description: renderVideo(video, embed),
		image: video.thumbnail.nHdUrl || video.thumbnail.largeUrl || video.thumbnail.middleUrl,
		upvotes: video.count.like,
		comments: video.count.comment
	}));
	return {
		title: `${userInfo.nickname} - ニコニコ`,
		link: `https://www.nicovideo.jp/user/${id}/video`,
		image: userInfo.icon,
		item: items
	};
};
const route = {
	name: "User Videos",
	path: "/user/:id/video/:embed?",
	parameters: {
		id: "User ID",
		embed: "Default to embed the video, set to any value to disable embedding"
	},
	example: "/nicovideo/user/16690815/video",
	maintainers: ["TonyRL"],
	radar: [{
		source: ["www.nicovideo.jp/user/:id", "www.nicovideo.jp/user/:id/video"],
		target: "/user/:id/video"
	}],
	handler
};
//#endregion
export { route };
